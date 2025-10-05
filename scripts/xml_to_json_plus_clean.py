import xmltodict
import json
import argparse
import os

def clean_node(node):
    if isinstance(node, dict):
        # Flatten nodes with '@name' and '@value'
        if '@name' in node and '@value' in node:
            return {node['@name']: node['@value']}

        # Unwrap dicts like {"@name": "...", "classref_": [...]}
        if '@name' in node:
            content = {k: v for k, v in node.items() if not k.startswith('@')}
            if len(content) == 1:
                sole_key, sole_val = next(iter(content.items()))
                if sole_key.endswith('_') and isinstance(sole_val, list):
                    return {node['@name']: clean_node(sole_val)}

        result = {}

        for key, val in node.items():
            if key.startswith('@'):
                continue

            cleaned_val = clean_node(val)

            if key in ('class', 'class_'):
                if isinstance(val, dict):
                    type_name = val.get('@name') or val.get('@type') or 'unknown_type'
                    result[type_name] = cleaned_val
                elif isinstance(val, list):
                    for item in val:
                        type_name = item.get('@name') or item.get('@type') or 'unknown_type'
                        cleaned_item = clean_node(item)
                        if type_name in result:
                            if isinstance(result[type_name], list):
                                result[type_name].append(cleaned_item)
                            else:
                                result[type_name] = [result[type_name], cleaned_item]
                        else:
                            result[type_name] = cleaned_item
                else:
                    result[key] = cleaned_val

            elif key in ('u32_', 's32_', 'bool_', 'string_', 'f32_'):
                if isinstance(cleaned_val, list):
                    merged = {}
                    for d in cleaned_val:
                        if isinstance(d, dict):
                            merged.update(d)
                    result.update(merged)
                elif isinstance(cleaned_val, dict):
                    result.update(cleaned_val)
                else:
                    result[key] = cleaned_val
            else:
                result[key] = cleaned_val

        return result

    elif isinstance(node, list):
        return [clean_node(item) for item in node]

    else:
        return node




def convert(xml_path, json_path):
    with open(xml_path, 'r', encoding='utf-8') as xml_file:
        data_dict = xmltodict.parse(xml_file.read())
    cleaned = clean_node(data_dict)
    with open(json_path, 'w', encoding='utf-8') as json_file:
        json.dump(cleaned, json_file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert XML to cleaned JSON with dynamic type keys.")
    parser.add_argument("xml", help="Input XML file path")
    parser.add_argument("json", nargs='?', help="Output JSON file path (optional)")

    args = parser.parse_args()
    xml_path = args.xml
    json_path = args.json if args.json else os.path.splitext(xml_path)[0] + ".json"

    convert(xml_path, json_path)
    print(f"Converted '{xml_path}' to cleaned JSON '{json_path}'")
