By including the `lang` attribute at the root of your HTML page, user agents (including the *Passmarked* web crawler) will be able to interpret the natural language used throughout your web application. If this attribute is left unspecified, *Passmarked* cannot determine which language must be used for spellchecking. 

As an aside, the `lang` attribute is, in fact, a global attribute. This means it can be added to any element in a document.
Web applications that have been heavily internationalised may rely on this property of the `lang` attribute and pepper it heavily across a document employing different values. Like any other attribute available in HTML, it can be selected in CSS. This could allow you, as a developer, to style languages differently throughout a document or application.

```
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body></body>
</html>
```

# How do I fix this ?

Simply add the `lang` attribute and the two-letter code for your locale as the attribute value to the root `html` tag in your documents.

# Resources

* [W3C - Why use the language attribute?](http://www.w3.org/International/questions/qa-lang-why.en.php)
