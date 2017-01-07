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
mrcrowley --config=<config_json_src> --save=<file_to_save_src>
```

-------------------

## Configuration

```json
{
    "projectId": "<project_id>",
    "projectName": "<project_name>",
    "throttle": 1000,
    "data": [{
        "src": ["<url_path>"],
        "name": "<request_name>",
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

- `retrieve`: Besides using a simplified `retrieve` you may also nest it to get contained data

    ```json
    {
        "src": ["..."],
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

### Examples
Go under the [src/_test/data](src/_test/data) folder and check the `*.json`.

