# Cyberpunk RED - Welcome to The Street!

A implementation for the Cyberpunk RED TRPG Core Roles for FoundryVTT.

This project is under heavy development to get a working experience together, so please prepare yourself for a lot of change when using this it. We aim to be responsive so if you have suggestions, concerns, or ideas, please come talk to us!

# Installing

The recommended installation method is with the usual FoundryVTT installer (see the [tutorial](https://foundryvtt.com/article/tutorial/)). Our work is listed as [https://foundryvtt.com/packages/cyberpunk-red-core](https://foundryvtt.com/packages/cyberpunk-red-core). 

Manifest: https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/raw/master/system.json

# Release Notes

See [CHANGELOG.md](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/blob/master/CONTRIBUTING.md)

# Join the team!

1.  Clone the repo!<br>
    > git clone git@gitlab.com:JasonAlanTerry/fvtt-cyberpunk-red-core.git<br>
    Conventions and more details on contributing to the process can be found in CONTRIBUTING.md

2.  Check the Trello!<br>
    The developers use Trello to plan out the next features. If you want to help, [have a look](https://trello.com/b/zb5FBnKS/project-red-roadmap-todo).

3. Check the issue lists<br>
    If you want to report a bug or help us squish them, [check the list](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/issues).

4.  Chat with us on [Discord](https://discord.gg/hpyz2nf6Vk)!

# Contributing to the Project

If you're interested in helping out, we would love to hear from you! Even if you're not a coder we can help you get started. Never too late to start a new hobby! Look over the [project wiki](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/wikis/home).

Read on to get a sense of the project's direction, the tools we use, and how we're organized. If you're still interested, continue to [CONTRIBUTING.md](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/blob/dev/CONTRIBUTING.md) to set up your dev environment.

## Useful Tools 

Have a look through here to get a sense of what you'll be using when contributing code to this project. You do not need to be an expert in all these things, they're provided as an overview.

- Our recommended IDE is [Visual Studio](https://code.visualstudio.com/) for editing JavaScript, CSS, and HTML.
- Since our source code lives in gitlab, you'll need to understand [git](https://git-scm.com/). This [article](https://dzone.com/articles/top-20-git-commands-with-examples) helps with understanding the concepts.
- To manage our CSS, we use [Gulp](https://gulpjs.com/) and [LESS](http://lesscss.org/). Do not make changes directly to main.css! Ever! Don't even think about it!
- [nodejs](https://nodejs.org/en/) is a big deal too. You'll use npm to manage packages.
- Foundry uses [Handlebars](https://handlebarsjs.com/) to product HTML templates.
- Of course, you'll need to be aware of the [FoundryVTT API](https://foundryvtt.com/api/), and read through how to do [system development](https://foundryvtt.com/article/system-development/) in it. Lastly, there's always the [Foundry wiki](https://foundryvtt.wiki/en/home) for more help.

## Useful and helpful links to learn what you need to get started with helping!

- https://dzone.com/articles/top-20-git-commands-with-examples
- https://foundryvtt.com/api/
- https://foundryvtt.com/article/system-development/
- https://handlebarsjs.com/
- https://foundryvtt.wiki/en/home

### Repository Layout

- **system.json** and **template.json** are necessary pieces to building a game system with Foundry. Check out the Foundry documentation for details on what those files are for.
- **less** this is where all of our css fragments are kept, and we use a combination of gulp and less to compile it into **main.css**. If you want to mess with the style and presentation of the UIs, this is the place.
- in **lang**, we'll keep internationalization templates, but we only support English today
- **templates** is where the Handlebars templates live, which are transformed into HTML documents by Foundry when the time is right. Folks with an interest in improving the UIs will work in here.
- Lastly, the **modules** directory is where the JavaScript that extends Foundry functionality is kept. This is where the plumbing exists to make the UIs do useful things.

## Setting Up Your Development Environment

For your first contribution, please make sure it is aligned with something in Trello first. If you have other things in mind, bring them in up Discord and see what the team thinks. More seasoned and regular contributors will get additional permissions in Trello to help steer and guide the project.

Setting up your environment is covered in [CONTRIBUTING.md](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/blob/dev/CONTRIBUTING.md) now.

### Updating CSS! IMPORTANT!

We are using less files, and gulp to manage our project CSS.

`DO NOT PUT CSS INTO MAIN.CSS! EVER! DON'T EVEN THINK ABOUT IT!`

> run: `npm i` within the project directory to install gulp, gulp-cli and gulp-less locally as dev dependencies.

> run: `npx gulp` to run the gulp command, this will also run watch, which will watch the project for changes.
