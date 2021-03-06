
import argparse
import logging
import json
import time
import os

from past.builtins import unicode

import apache_beam as beam
from apache_beam.io import ReadFromText
from apache_beam.io import WriteToText
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.options.pipeline_options import SetupOptions

def get_data_path(path=''):
  dirname = os.path.realpath('..')
  return "%s/data%s" % (dirname, path)

# removes shard indentifier (WriteToText function) from filename
def clean_output_file_names():
  path = get_data_path('/processed')
  for r, d, f in os.walk(path):
    for filename in f:
      print filename
      cleaned = filename.replace('00000-of-00001', '')
      if cleaned != filename:
        file_path = "%s/%s" % (path, filename)
        cleaned_path = "%s/%s" % (path, cleaned)
        os.rename(file_path, cleaned_path)

# returns (key,count)
def count_ones(element):
  (name, ones) = element
  return (name, sum(ones))

# returns "key,value"
def format_counts_csv(element):
  (name, ones) = element
  return "%s,%s" % (name, ones)

def format_navigation_counts_csv(element):
  (navigation, count) = element
  navigateFrom, navigateTo = navigation.split(':')
  return "%s,%s,%s" % (navigateFrom, navigateTo, count)

def run(argv=None):
  """Main entry point; defines and runs the pipeline."""
  parser = argparse.ArgumentParser()
  parser.add_argument('--input',
                      dest='input',
                      default='%s/user-events.log' % get_data_path('/raw'),
                      help='Input file to process.')
  parser.add_argument('--output',
                      dest='output',
                      # required=True,
                      default='%s' % get_data_path('/processed'),
                      help='Output file to write results to.')
  known_args, pipeline_args = parser.parse_known_args(argv)

  # We use the save_main_session option because one or more DoFn's in this
  # workflow rely on global context (e.g., a module imported at module level).
  pipeline_options = PipelineOptions(pipeline_args)
  pipeline_options.view_as(SetupOptions).save_main_session = True
  p = beam.Pipeline(options=pipeline_options)

  # read file into a PCollection and deserialize
  events = (p
    | 'read' >> ReadFromText(known_args.input)
    | 'deserialize' >> beam.Map(json.loads)
  )

  output = (events
    | 'pair_event_names' >> beam.Map(lambda x: (x['eventName'], 1))
    | 'group_event_names' >> beam.GroupByKey()
    | 'count_event_names' >> beam.Map(count_ones)
    | 'format_event_names_count' >> beam.Map(format_counts_csv)
    | 'write_event_names_count' >> WriteToText("%s/event_names_count-%s" % (known_args.output, time.time()), file_name_suffix='.csv', header='event_name,count')
  )

  # output user events count in the form of "user_id,count"
  output = (events
    | 'pair_user_events' >> beam.Map(lambda x: (x['userId'], 1))
    | 'group_user_events' >> beam.GroupByKey()
    | 'count_user_events' >> beam.Map(count_ones)
    | 'format_user_events_count' >> beam.Map(format_counts_csv)
    | 'write_user_events_count' >> WriteToText("%s/user_events_count-%s" % (known_args.output, time.time()), file_name_suffix='.csv', header='user_id,count')
  )

  def is_navigation_event(element):
    return element.has_key('navigateTo')

  def pair_navigation(element):
    navigation = "%s:%s" % (element['view'], element['navigateTo'])
    return navigation, 1

  # output navigation count in the form of "from:to,count"
  output = (events
    | "filter_navigations" >> beam.Filter(is_navigation_event)
    | "pair_navigations" >> beam.Map(pair_navigation)
    | 'group_navigations' >> beam.GroupByKey()
    | 'count_navigations' >> beam.Map(count_ones)
    | 'format_navigations_count' >> beam.Map(format_navigation_counts_csv)
    | 'write_navigations_count' >> WriteToText("%s/navigations_count-%s" % (known_args.output, time.time()), file_name_suffix='.csv', header='from,to,count')
  )

  result = p.run()
  result.wait_until_finish()

if __name__ == '__main__':
  logging.getLogger().setLevel(logging.INFO)
  while True:
    run()
    clean_output_file_names()
    time.sleep(60)
