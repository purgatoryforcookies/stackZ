# [1.6.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.5.0...v1.6.0) (2024-08-15)


### Bug Fixes

* remove possible profile word from aws config profiles ([2d9f215](https://github.com/purgatoryforcookies/stackZ/commit/2d9f21509a08167ca9c0342d24cc837a997ed681))


### Features

* execute remote env with the same shell as is terminal configured ([dba9096](https://github.com/purgatoryforcookies/stackZ/commit/dba90966679584e5ded572346f2353f8bcae3410))
* platform aware splitting ([c0464b6](https://github.com/purgatoryforcookies/stackZ/commit/c0464b6a7c15d958af1bc9da16e1ff547a3dd442))

# [1.5.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.4.0...v1.5.0) (2024-08-12)


### Features

* load profiles from aws config to autocomplete suggestions. ([a95365b](https://github.com/purgatoryforcookies/stackZ/commit/a95365b9bcc28339564badeaa4e9487c0d5b1d1d))

# [1.4.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.3.0...v1.4.0) (2024-08-01)


### Features

* bake environment to clipboard as a way to export the whole environment off from stackZ. added support for comments internally in the terminal. ([f1c9cbc](https://github.com/purgatoryforcookies/stackZ/commit/f1c9cbcb0ff9ee17608c699b4c4d718e991e21d8))
* show environment keys in the cmd k menu ([1dcd543](https://github.com/purgatoryforcookies/stackZ/commit/1dcd54383df21afa57b8297e4b9702a1ded46d12))

# [1.3.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.2.0...v1.3.0) (2024-07-30)


### Bug Fixes

* ok no json then. fixed tests and updated app.getpath paths for testing environment. ([827f443](https://github.com/purgatoryforcookies/stackZ/commit/827f443f0c4d2567468f77c5945f52377d974220))


### Features

* from LRparser to StreamParser. Alot simpler to setup for simpler language ([e1417e6](https://github.com/purgatoryforcookies/stackZ/commit/e1417e6a18e58df3cbc2a345f72448c5d218969e))
* improved regexes for dotenv lang ([9e83879](https://github.com/purgatoryforcookies/stackZ/commit/9e8387934218fabee6f8a788a829c88e1ec82637))
* new environment editor. Includes feats like autocompletion, linting, styles ([d19d2a1](https://github.com/purgatoryforcookies/stackZ/commit/d19d2a19ecd3b3ddd4b7cdb1107cbf7a362fe585))
* preminilary support for dotenv lang in codemirror ([ba9c7e9](https://github.com/purgatoryforcookies/stackZ/commit/ba9c7e971283d2c58b45ff0c033d2c446e306e56))

# [1.2.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.1.0...v1.2.0) (2024-07-24)


### Bug Fixes

* bugfix for deleting environments via order. Fixes erratic behaviour where removing an environment caused reordering to leave OS environments with an order of != 0 ([231956f](https://github.com/purgatoryforcookies/stackZ/commit/231956f8ec31b793a52e1e190a1de21a42f5f31e))
* settings button on navbar had limited click area ([7e3a136](https://github.com/purgatoryforcookies/stackZ/commit/7e3a1363cbfc6b87315d9cc611562b7fd5622043))


### Features

* drafting of integrated environment set ([00cd9bf](https://github.com/purgatoryforcookies/stackZ/commit/00cd9bfb29712b89709ee6a0ec2b37aca84e8ca0))
* environment service upgraded to handle remote sets and refresh them ([241b36b](https://github.com/purgatoryforcookies/stackZ/commit/241b36b92876db8ae2be3a6d2706067dadf8d335))
* loading indicator, bugfixes, error messages from remote refresh ([6f04975](https://github.com/purgatoryforcookies/stackZ/commit/6f049759a236d33874bc097c316e908eb99a6bc6))
* offline mode for remote environment sets ([43b78ca](https://github.com/purgatoryforcookies/stackZ/commit/43b78ca9565aef6aacb3d24865e82e002612939a))
* remote environment icons to show meta options easily. clicking on timestamp also refreshes the environment ([4fd0d22](https://github.com/purgatoryforcookies/stackZ/commit/4fd0d2235e242fecf28f7d580f255600f7fb7173))
* styles, better loading bar, remote terminals refresh on paraller during baking ([c53ba1a](https://github.com/purgatoryforcookies/stackZ/commit/c53ba1ae6025c69d35682ba57fe8df3c82f4956c))
* synced remote environments are fetched befor terminal starts ([4ced4bc](https://github.com/purgatoryforcookies/stackZ/commit/4ced4bc701d0e37966d73fa8afde73b90f5c66f7))

# [1.1.0](https://github.com/purgatoryforcookies/stackZ/compare/v1.0.1...v1.1.0) (2024-07-18)


### Features

* remove version name from builds due to semver bot ([0957b7d](https://github.com/purgatoryforcookies/stackZ/commit/0957b7df1714b8a2ec16694c4398573147ecd4b7))
* test ([20c8987](https://github.com/purgatoryforcookies/stackZ/commit/20c8987636c5d50ebb3f52da4739499d1b5a150f))
* test ([831867b](https://github.com/purgatoryforcookies/stackZ/commit/831867bc0fabc308cc5ca833d52b4eb4b48a14bc))

## [1.0.1](https://github.com/purgatoryforcookies/stackZ/compare/v1.0.0...v1.0.1) (2024-07-18)


### Bug Fixes

* write package json version ([6ec113a](https://github.com/purgatoryforcookies/stackZ/commit/6ec113a12b7cca1a7bdbae93510e7fb607bab188))

# 1.0.0 (2024-07-18)


### Bug Fixes

* its master not main ([d31fb9f](https://github.com/purgatoryforcookies/stackZ/commit/d31fb9f99c7f1cb5ebb8ad365c47538e5d9afe6a))
* remove label from assets ([0d3232c](https://github.com/purgatoryforcookies/stackZ/commit/0d3232cd8f9950aef98f68c8f8a89a4fb3a9d16a))
* test ([40e7379](https://github.com/purgatoryforcookies/stackZ/commit/40e73790f7b9e159791ce4e944bf267b9d57ad8f))


### Features

* config ([80bd08c](https://github.com/purgatoryforcookies/stackZ/commit/80bd08c6bccc8adea0f8aef584f837d59f68dbbd))
* First release. ([f7a64cb](https://github.com/purgatoryforcookies/stackZ/commit/f7a64cb5d3a1efffa852325e260250f77226aa54))
* more config ([1ccbdf4](https://github.com/purgatoryforcookies/stackZ/commit/1ccbdf4e10ef87a9610c77a42cbb471d1bb10d36))
