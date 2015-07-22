# Restle Test Suite
This test suite aims to semantically mirror the [JSON API SPEC](http://jsonapi.org/) and to achieve 100% coverage. Test names are signified with a number indicating a specification defined below (i.e. 3.1: `data` and `error` members not present in the document).

## TODO
* Ensure overview matches closely with the specification
* Write tests that match the flow of the overview
* Modularize the tests

## Overview
1. Client resonsibilities
  1. <u>TODO</u> Define what these are
2. Server responsibilites
  1. Must set `Content-Type: application/vnd.api+json`
  2. Send status `415` if a client includes any media type parameters
  3. Send status `406` if client makes media type modifications
3. Structure
  1. If the top-level `data` member is present, the top-level `errors` member should not be
    1. If retrieving a single resource, the `data` member should be `null` or a <em>resource identifier object</em>
    2. If retrieving many resources, the `data` member should be `[]` or many <em>resource identifier objects</em>
    3. If retrieving many resources, but only one resource is currently in the database, the `data` member should still be an array
  2. If the top-level `data` member is not present, the top-level `included` member is not present
  3. The `links` member should have:
    1. A `self` member
    2. If `options.support.pagination: true`, `links` member should have a `pagination` member
4. Resource objects
  1. Identification
    1. Must contain a `id` and `type` member
    2. The `id` and `type` members must be type `String`
    3. The values of `type` must adhere to the same constraints as `member names`
  2. Fields
    1. Attributes and relationships cannot have same name
    2. Attributes and relationships cannot be named `id` or `type`
  3. Attributes
    1. Assert `typeof attribute === object`
    2. Must not have a `relationships` or `attributes` member
  4. Relationships
    1. Assert `typeof relationship === object`
    2. May be <em>to-one</em> or <em>to-many</em>
    3. Must contain at least a `links` member (with at least a `self` or `related` member), a `data` resource linkage, or a `meta` member
    4. A <em>to-many</em> relationship may have pagination links under the `links` member
  5. Related resource links
    1. Must be a valid URL
    2. Must fetch a valid resource
  6. Resource linkage
    1. Must be `null` (empty <em>to-one</em> relationship)
    2. Must be `[]` (empty <em>to-many</em> relationshp)
    3. Must be single resource identifier object (non-empty <em>to-one</em>)
    4. Must be array of resource identifier objects (non-empty <em>to-many</em>)
  7. Resource links
    1. May contain `self` link
    2. Server must respond to a `GET` with the resource as the primary data
  8. Resource identifier objects
    1. Must include `id` and `type` members
    2. May include the `meta` member
  9. Compound documents
    1. Must be represented within the `included` member
    2. Every included <em>resource object</em> must be identified by at least one <em>resource identifier object</em> within the same document
    3. The included object can be <em>primary data</em> or <em>resource linkage</em>
    4. Must not show linkage data that is excluded by <em>sparse fieldsets</em>
    5. Must not include more than one <em>resource object</em> for each `type and` `id` members
  10. Meta information held within the `meta` member
  11. Links
    1. The `links` member must assert `typeof links === object`
    2. The value of a `links` member must be a `String` or `{ href: "http://example.com", meta: "Some meta" }`
  12. Member names
    1. Must be treated as case sensitive by client and server
    2. Must contain at least <strong>one</strong> character
    3. Globally allowed characters `a-z`, `A-Z`, `0-9`, `-`, `_`
    4. Can only start or end with `a-z`, `A-Z`, `0-9`
5. Fetching data
  1. Must support fetching from:
    1. The `links.self` member at the top level
    2. The `links.self` member at the resource level
    3. The `links.related` member at the relationship level
  2. Responses
    1. Must be `200 OK` for a successfully retrieved resource
    2. Must be `404 Not Found` if a single resource does not exist
    3. Should include proper messages and codes in the top level `errors` member
  3. Fetching relationships
    1. Must support fetching relationship data provided by the `self` link within a relationships `links` member
    2. Must be `200 OK` for a successfully retrieved relationship
    3. The <em>primary data</em> must match value for <em>response linkage</em>
    4. Must be `404 Not Found` if relationship link not found
  4. Inclusion of related resources
    1. May support the `include` query param to customize included relationships
    2. Must return `400 Bad Request` if the `include` query param is not supported by the server
    3. If the `include` query param is present, the server must not include unrequested <em>resource objects</em>
    4. The `include` query params must be comma separated
    5. If an unknown `include` query param is found, server must return `400 Bad Request`
    6. Create an alias for <em>related resource object attributes</em> (i.e. comments.author -> comments-author)
  5. Sparse field sets
    1. May support the `fields` query params for filtering which fields are returned, and the format should look like `fields[TYPE]`
    2. The `fields` query params must be comma separated
    3. If the `fields` query params are present, the server must not include unrequested <em>fields</em>
  6. Sorting
    1. May support the `sort` query param to sort <em>resource objects</em>
    2. Recommended to use `author.name` to sort attributes of relationships
    3. The sort fields should be applied in the order specified
    4. Order must be <em>ascending</em> by default, and <em>descending</em> with the `-` token in front
    5. The server must return `400 Bad Request` if sorting is not supported
  7. Pagination
    1. May support the `pagination` member in the `links` object
    2. If supported, must appear in the `links` top level object or the `links` included level object
    3. If supported, the `paginaton` member must have the `first`, `last`, `prev`, and `next` members
    4. The `page` query param should be used for pagination
    5. The <em>page based</em>, <em>offset</em>, and <em>cursor</em> pagination strategies should be the pagination options
  8. Filtering
    1. May support the `filter` key word
6. Creating, reading, updating, and deleting
  1. Must completely succeed or fail for a <em>resource transaction</em>
  2. Creating (POST /articles)
    1. Request body must have a `data` member and a `type` member inside of that `data` object
    2. If relationships are present in the request body, must have a `data` member
    3. Must respond with `201 Created` if successfully created
    4. Should include the `Location` header
    5. The value of the `links.self` should match the `Location` header
    6. Must respond with `202 Accepted` if successfull but not yet created
    7. Must respond with `403 Forbidden` if there is an unsupported request to create a resource
    8. Must respond with `409 Conflict` if the `type` does not match the endpoint
    9. Should include valid error details
  3. Updating (`PATCH /articles/1`)
    1. Request body must have a `data` member and `type` and `id` members inside of that `data` object
    2. If not all the attributes included in request body, must interpret missing attributes as if they were included with their current values
    3. Must not interpret missing attributes as `null` values
    4. Must not interpret missing relationships as `null` values
    5. If a <em>relationship object</em> is included it must be an object with a `data` member, and the relationship's value will be replaced by the request body value
    6. Server may reject full replacement of a <em>to-many</em> relationship, if so must repond with `403 Forbidden`
    7. Must respond with `202 Accepted` if successfull but not updated yet
    8. Must respond with `200 OK` if update is successfull and fields outside of the requested changes were modified, and server must respond with updated document
    9. Must respond with `204 No Content` if only the requested fields were updated, nothing else
    10. Must respond with `403 Forbidden` if a unsupported request tried to update something
    11. Must respond with `404 Not Found` if the <em>resource object</em> is not found
    12. Must respond with `409 Conflict` if `type` and `id` do not match the endpoint
    13. Should include error details
  4. Updating relationships (`PATCH /articles/1/relationships/author`)
    1. Must respond to a `PATCH` for a <em>to-one</em> relationship link
    2. For a <em>to-one</em>, request body must contain a `data` member that contains either a <em>resource identifier object</em> relating to the new resource or `null` to remove the relationship
    3. Must respond to a `PATCH`, `POST`, or `DELETE` for a <em>to-many</em> relationship
    4. For a <em>to-many</em>, the request body must contain a `data` member whose value is `[]` or an array of <em>resource identifier objects</em>
    5. Doing `PATCH` to a <em>to-many</em> should do a full replacement of the relationships array
    6. Doing `POST` to a <em>to-many</em> should add to the array
    7. Doing `DELETE` to a <em>to-many</em> must remove the relationships matching the `type` and `id` members of the request body
  5. Deleting resources (`DELETE /articles/1`)
    1. Respond with `202 Accepted` if successful but not done yet
    2. Respond with `204` if successful and no response body
    3. Respond with `200` if good and responds with top level `meta` member
7. Query params
  1. Must adhere to same rules as <em>member names</em>
  2. Must contain at least one non `a-z` character
