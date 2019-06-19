# mimic

Mimic is a mockup server for REST API that tend to help you on a development and testing stages.
With mimic you can easily mockup some third-party REST API's (for now, only JSON based).

## Documentation

Mimic interprets json files as a REST API response.
There is a strict rule for mockup file names.

Typical mimic-friendly mockup file name should follow the next pattern `[HTTP Method].[API resource].json`.
Where `HTTP Method` is (`get` | `post` | `put` | `delete`).

For example, let's say you want to mock API response for loading list of products.
The mockup file name will be `get.products.json` and it should contain your mocked products in json format.

## How to use it

The most efficient way of run mimic is to use a docker.
Following command will start a docker container with running mimic.

 - `docker run --rm -d -v $PWD:/mimic/mocks -p 8080:8080 zhikiri/mimic:latest`

Notice that mocks are passed into the container as volume and mimic is running on a 8080 port.
