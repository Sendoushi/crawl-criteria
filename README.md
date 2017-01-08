# MrCrowley

Retrieve data from different websites using html elements to gather the information you need.

[![Build Status](https://travis-ci.org/Sendoushi/mrcrowley.svg?branch=master)](https://travis-ci.org/Sendoushi/mrcrowley)

----------

## Installation

- Install [node](http://nodejs.org)

```sh
npm install -g mrcrowley
mrcrowley --config="/home/user/.crawl.json" --save="/home/user/crawlResults.json"
```

----------

## Usage

#### Core usage

I still have to document how you can `require` and use the `core` directly but just so that you know, you can do it and the results are based on `promises`.

#### CLI

Set a `.crawl.json` and run all the tasks you want when you pass it to `mrcrowley`.<br>

**Note:**
Any kind of path should be absolute or relative to the place the script is called.

```sh
mrcrowley --config=<config_json_src> --output=<file_to_save_src> --force=<false|true>
```

**Notes:**
- `<config_json_src>`: Path to the config json for crawling. It is required
- `<file_to_save_src>`: Path for the file you want to have the results. For now, only `json` is supported. It is required
- `force`: It forces to create a new output. If false and the output file exists, it will just update. It will default to `false`

-------------------

## Configuration

```json
{
    "projectId": "<project_id>",
    "projectName": "<project_name>",
    "data": [{
        "src": "<url_path>",
        "name": "<request_name>",
        "throttle": 2000,
        "enableJs": false,
        "waitFor": "<html_selector>",
        "modifiers": {
            "<query_var_in_url>": ["<var_to_replace>"]
        },
        "retrieve": {
            "<name>": {
                "selector": "<html_selector>",
                "attribute": "<attribute_to_retrieve>",
                "ignore": ["<regex_pattern_to_ignore>"]
            }
        }
    }]
}
```

**Notes:**

- `retrieve`: Besides the simplified version, you may also nest it to get contained data

    ```json
    {
        "src": "...",
        "retrieve": {
            "<name>": {
                "selector": "<parent_html_selector>",
                "retrieve": {
                    "<name>": {
                        "selector": "<child_html_selector>",
                        "attribute": "<attribute_to_retrieve>",
                        "ignore": ["<regex_pattern_to_ignore>"]
                    }
                }
            }
        }
    }
    ```
- `attribute`: If not provided, text content will be returned. Optional key.
- `ignore`: Ignore results with a regex pattern. Optional key.
- `enableJs`: Javascript isn't enable by default for security reasons. Use this if you really need it
- `waitFor`: Usually used with `enableJs`. If the sources uses javascript to render, you may `waitFor` the selector to be present. It will only wait `20` seconds
- `<var_to_replace>`: It can also be an object with keys `min` (it will default to `0`) and `max` (it will default to `10`)

    ```json
    {
        "src": "...",
        "modifiers": {
            "<query_var_in_url>": ["<var_to_replace>"],
            "<limit_var_in_url>": [{
                "min": 0,
                "max": 10
            }]
        },
        "retrieve": {}
    }
    ```

### Examples
Go under the [src/_test/data](src/_test/data) folder and check the `*.json`.

