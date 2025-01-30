# 📚 Assets Plugin for Backstage

An asset/inventory plugin that allows you to save physical items and their locations.

Status: 🧪 early stage

<br/>

## Current status

Currently it supports different items and locations (without any kind of validation yet!). There is no custom UI yet.

### Personal belongings (example)

```yaml
apiVersion: assets.backstage.io/v1alpha1
kind: Building
metadata:
  name: home
---
apiVersion: assets.backstage.io/v1alpha1
kind: Room
metadata:
  name: kitchen
spec:
  parent: building:home
---
apiVersion: assets.backstage.io/v1alpha1
kind: Item
metadata:
  name: coffee-machine
spec:
  location: room:kitchen
```

Default catalog types and kinds:

1. Item kinds: `Item` and `Container`
2. Location kinds: `Shelf`, `Room`, `Floor`, `Building`, `Campus`

### Data center (example)

```yaml
apiVersion: assets.backstage.io/v1alpha1
kind: Building
metadata:
  name: west-1
---
apiVersion: assets.backstage.io/v1alpha1
kind: Rack
metadata:
  name: r-32-231
spec:
  location: building:west-1
---
apiVersion: assets.backstage.io/v1alpha1
kind: Server
metadata:
  name: svr-4711
spec:
  location: rack:r-32-231
  mac: x2:xx:xx:xx:xx:xx
---
apiVersion: assets.backstage.io/v1alpha1
kind: Harddrive
metadata:
  name: hd-1234-0000
spec:
  location: server:svr-4711
  installed: '2024-10-10'
```

1. Item kinds: `Rack`, `Server`, `Harddrive`
2. Location kinds: `Building`

Expect additional, custom catalog plugins could show information based on these data.

## Contributions

This plugin looks for any kind of feedback, input and contributions. Feel free to open an issue or pull request.

## Roadmap

- [x] Catalog module to enable asset types.
- [ ] Repository tooling (run tests, release plugins and modules)
- [ ] Custom UI, backend and DB schema to create and edit items.
- [ ] Support for pictures (save them in the local FS, DB, S3?)
- [ ] Mark items as rented by an user
- [ ] Permissions framework
- [ ] Audit logs

## Architecture goal

1. **Reuse the catalog**

   This will allow users to start using the assets 'the Backstage GitOps' way.

   Similar to the catalog, and other catalog-driven plugins,
   users can import items and locations from YAML files (see current status below).

   Other plugins (incl. the own assets backend, see 3) have then the opportuniy
   to add, link or extend this items and locations.

2. **Frontend**

   The catalog UI is a great start to use the assets.

   But this plugin will have a UI with a focus on seeing items together with pictures,
   creating and editing items and locations.

3. **Backend**

   The catalog itself will not allow users to store data, upload pictures, add notes.

   For all this a custom backend will be required.
