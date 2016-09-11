If the language attribute of the `<html>` element is incorrectly specified, browsers rendering your page will be unable to interpret the natural language of your copy. This may also affect the appearance of your webpage if any CSS or JavaScript relies on correctly specified language codes.

# How do I fix this?

Edit the source code that generates the HTML page containing the attribute error.

```
<!-- incorrect: <html lang="xyz"> -->
<!-- correct:   <html lang="en"> -->
  <head>
    <title>My Webpage</title>
  </head>
  <body></body>
</html>
```

# Resources

* [Why use the language attribute?](https://www.w3.org/International/questions/qa-lang-why.en)
