There are two patterns for inline documenting the contracts with [NatSpec](https://docs.soliditylang.org/en/latest/natspec-format.html) that don't generate the expected output.
To fix this, we created the _fixMd.js_ script.

Possible causes: solidity-docgen or solc version used.

# Case 1

The following pattern...

```
/**
 * @notice Contract documentation
 */
```

...generates the following output:

```
*
Contract documentation
/
```

When the actual output should be:

```
Contract documentation
```

# Case 2

The following pattern...

```
/// @notice Contract documentation
```

...generates the following output:

```
// @notice Contract documentation
```

When the actual output should be:

```
Contract documentation
```
