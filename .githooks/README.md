# Install git-hooks

You must configure your local git to activate the custom git-hooks location.

```bash
> git config core.hooksPath .githooks
```

In case your git-client does not work with custom githooks locations (thanks git Kraken 😡), you have to execute the following in your repo
root

```bash
> cp -R .githooks/dot-git/* .git/hooks/
```
