# Cyberpunk RED - Welcome to The Street!
A implementation for the Cyberpunk RED TRPG Core Roles for FoundryVTT.
More to come!

# Installing
Manifest: https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/raw/master/system.json
# Release Notes
todo..
# Join the team!
 
 1. Clone the repo!
     > git clone git@gitlab.com:JasonAlanTerry/fvtt-cyberpunk-red-core.git
     
      Conventions and more details on contributing to the process can be found in CONTRIBUTING.md

 2. Check the Trello!<br>
    https://trello.com/b/zb5FBnKS/project-red-roadmap-todo

 3. Chat with us on Discord!<br>
    https://discord.gg/gASBkXWm

 4. Profit???


## Contributing to the Project
If you're interested in helping out, we would love to hear from you! Even if you're not a coder
we can help you get started. Never too late to start a new hobby! 

Read on to get a sense of the project's direction, the tools we use, and how we're organized. If you're still interested, continue to [CONTRIBUTING.md](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/blob/dev/CONTRIBUTING.md) to set up your environment.

### Useful Tools
Have a look through here to get a sense of what you'll be using when contributing code to this project. You do not need to be an expert in all these things, they're provided as an overview.
 - Our recommended IDE is [Visual Studio](https://code.visualstudio.com/) for editing JavaScript, CSS, and HTML.
 - Since our source code lives in gitlab, you'll need to understand [git](https://git-scm.com/). This [article](https://dzone.com/articles/top-20-git-commands-with-examples) helps with understanding the concepts.
 - To manage our CSS, we use [Gulp](https://gulpjs.com/) and [LESS](http://lesscss.org/). Do not make changes directly to main.css! Ever! Don't even think about it!
 - [nodejs](https://nodejs.org/en/) is a big deal too. You'll use npm to manage packages.
 - Foundry uses [Handlebars](https://handlebarsjs.com/) to product HTML templates.
 - Of course, you'll need to be aware of the [FoundryVTT API](https://foundryvtt.com/api/), and read through how to do [system development](https://foundryvtt.com/article/system-development/) in it. Lastly, there's always the [Foundry wiki](https://foundryvtt.wiki/en/home) for more help.

### Quick Project Tour
 - *system.json* and *template.json* are necessary pieces to building a game system with Foundry. Check out the Foundry documentation for details on what those files are for.
 - *less* this is where all of our css fragments are kept, and we use a combination of gulp and less to compile it into *main.css*. If you want to mess with the style and presentation of the UIs, this is the place.
 - in *lang*, we'll keep internationalization templates, but we only support English today
 - *templates* is where the Handlebars templates live, which are transformed into HTML documents by Foundry when the time is right. Folks with an interest in improving the UIs will work in here.
 - Lastly, the *modules* directory is where the JavaScript that extends Foundry functionality is kept. This is where the plumbing exists to make the UIs do useful things.

### Setting Up Your Development Environment
This is covered in [CONTRIBUTING.md](https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/blob/dev/CONTRIBUTING.md) now.

