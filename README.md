# Battlefield 2042 AutoVehicle

## About
Battlefield 2042 vehicle macro with shortcuts easily.

Current Shortcuts:
- ALT+K to enable (macro will work if you choose vehicle)
- ALT+ to disable

This program can handle auto and *only* vehicke macros. Do not use macros for aiming/controlling your weapon.

For bugs, ideas: Feel free to post an [Issue](https://github.com/schwarzsky/battlefield2042-autovehicle/issues) or [PR](https://github.com/schwarzsky/battlefield2042-autovehicle/pulls).

**Current plans to work:**
- [ ] Add an image input for custom UI Colors
- [ ] Add custom keys for macros
- [ ] Lowerize the working time of process
- [ ] More ways to handle macro as perfects as possible

## Development
- Make sure your system supports as `iohook` [platforms](https://github.com/wilix-team/iohook#platform-support).
- `node-gpy` should be installed properly as [mentioned here.](https://github.com/nodejs/node-gyp#on-windows)
- `npm install` preferred, or `yarn`.
- NodeJS version must be same as mentioned in `package.json`
```js
"engines": {
    "node": ">=10.13.0"
},
```
