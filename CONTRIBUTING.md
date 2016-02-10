## Documentation

Restle's API uses JSDoc but with a few specifics: use `@returns` instead of `@return`,
add new lines before and after examples, use `@async` keyword for functions that return
Promises, use `@throws` after `@returns` for Promises that reject to a specific value,
use single word descriptors like `@async` and `@private` before `@params`,
capitalize param types, i.e. `{Object}`, put `@todo` statements after `@params`
with a blank line between `@params` and `@todo`, and put `// TODO: ...` in
code blocks only if they match a `@todo` in the documentation.
