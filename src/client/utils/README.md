
# Update translations

```bash
node utils/update-translations.js csvfile ../doc-bdms/i18n/web-bdms-translations.csv 
```


# Using docker

    
```bash
cd ..
docker run --rm -it \
    --network="host" \
    -v $PWD:/workspace \
    -w /workspace/web-bdms \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    -e PORT=3011 \
    -e NODE_OPTIONS=--openssl-legacy-provider \
    node:17.6.0-alpine3.15 \
    node utils/update-translations.js csvfile \
        ../doc-bdms/i18n/web-bdms-translations.csv 
```