# 📚 Assets Plugin for Backstage

An asset/inventory plugin that allows you to save physical items and their locations.

Status: 🧪 early-stage / experimental

<br/>

This is a 🚧 work-in-process plugin to save assets in the ~~software~~ catalog of Backstage.

This plugin is looking for any kind of feedback, input and contributions.

The goal is scaleable plugin that address personal and (simple) corporate needs.

## Roadmap

- 0.1: Catalog module to enable asset types.
- 0.2: Custom UI, backend and DB schema to create and edit items.
- 0.3: Support for pictures (save them in local FS or DB?)
- 0.4: Mark items as rented by an user
- 0.5: Permissions framework
- 0.6: Audit logs

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

## Current status

Currently it supports different items and locations (without any kind of validation!):

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

1. Items: `Item` and `Container`
2. Locations: `Shelf`, `Room`, `Floor`, `Building`, `Campus`
