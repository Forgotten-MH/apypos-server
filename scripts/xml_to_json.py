import xmltodict
import json
import argparse
import os

def convert(xml_path, json_path):
    with open(xml_path, 'r', encoding='utf-8') as xml_file:
        data_dict = xmltodict.parse(xml_file.read())

    with open(json_path, 'w', encoding='utf-8') as json_file:
        json.dump(data_dict, json_file, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert XML to JSON.")
    parser.add_argument("xml", help="Path to the input XML file")
    parser.add_argument("json", nargs='?', help="Path to the output JSON file (optional)")

    args = parser.parse_args()
    
    xml_path = args.xml
    if args.json:
        json_path = args.json
    else:
        base, _ = os.path.splitext(xml_path)
        json_path = base + ".json"

    convert(xml_path, json_path)
    print(f"Converted '{xml_path}' -> '{json_path}'")
