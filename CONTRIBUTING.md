# Contributing to FoundryVTT Cyberpunk Red System

Our process flow:

> *ideas & discussion -> gitlab issue_card -> personal_branch -> dev -> master -> release*

The **dev** branch is our merge point for code, it represent the code in the state of now, **master** represents the pre-release work, this is for final testing and cleanup by the core maintainers before pushing out a full user release.

To get working on new features and fixes we create a new branch from the **dev** branch, folks should remember to commit early and often, even if the branch is broken/not working, push often too, so that others may pull the branch and take a look at things and possibly help out, and then laslty we create a merge request to **dev** when we all feel it's time that work is functional enough to a part of the system as a whole.

For the *personal_branch*, the convention we have been using is:

> \<personal-identifier\>-\<what-you-are-working-on\> or \<personal-identifier\>-\<issue#XXX\>

For instance, a branch where a developer named *Jay* might be working on the *character sheet*, or if they are working on *issue #7*, might be called:

> **jay-character-sheet-update-skills** or **jay-issue#7**

This document will walk through the installation/configuration of a development environment to help you start contributing.

The assumption of this document is you already have FoundryVTT installed and running on a system and you're planning to utilize that system to do your development work on.  This is the easiest option, as you can test your changes in real time.

# Working Environment Configuartion

We will cover configuring both Linux and Windows in this document.  Regardless of which environment you're using, you will need the FoundryVTT location where it is storing the User Data. If you don't remember where that directory is, pop open your browser, connect to your FoundryVTT system, go into Setup and look at the Configuration Tab to see what *User Data Path* is set to. Make a note of this as your **Foundry User Data Path** when it is referenced in the configuration section below.
# Development on Linux

We are assuming you are familiar with the distribution of Linux you are using and comfortable with the installation of packages/software.  If you're not, ask in the Discord channel and someone can assist with this aspect.

Here's the steps that you will need to perform:

- Install the package: git
- Once installed, open a terminal/command line which will open a terminal and typically defaults to your home directory.
- Change directory to the **Foundry User Data Path**
  > `cd` \<**`Foundry User Data Path`**\>
- Change into the systems directory:
  > `cd Data/systems`
- Clone the repository with the following command:<br>
  > `git clone https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core.git cyberpunk-red-core`

At this point, you should be able to restart your FoundryVTT server and you should now see **Cyberpunk RED - CORE** listed in your game systems.  You can now create a world using this game system to use for testing purposes.  As you make changes to the code, you will want to hit ESC in your game world and select "Reload Application" to reload any changes you made to test them.

Your Linux environment is all setup now, please jump down to the **Development using git**.

# Development on Windows

First, you're going to need to download and install git for Windows.  You can do that from here:

https://git-scm.com/download/win

After installation, hit your Windows Key then find and run **Git CMD**. 

- Change directory to the **Foundry User Data Path**
  > `cd` \<**`Foundry User Data Path`**\>
- Change into the systems directory:
  > `cd Data\systems`
- Clone the repository with the following command:<br>
  > `git clone https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core.git cyberpunk-red-core`

At this point, you should be able to restart your FoundryVTT server and you should now see **Cyberpunk RED - CORE** listed in your game systems.  You can now create a world using this game system to use for testing purposes.  As you make changes to the code, you will want to hit ESC in your game world and select "Reload Application" to reload any changes you made to test them.

Your Windows environment is all setup now.  You can close the **Git CMD** and re-open one without Administrative privileges if you like.  To continue, please jump down to the **Development using git**.

# Development using git
Checkout this blog which outlines the must-know commands of git, with examples!

> https://dzone.com/articles/top-20-git-commands-with-examples

To do development work, simply change into the cyberpunk-red-core directory in your FoundryVTT systems location and then create a new code branch in git:
> `git checkout -b` \<`personal-identifier`\>-\<`what-you-are-working-on`\>

This is going to create a local branch on your development system and is not visible or saved on Gitlab.  When you're done working, or you want to take a break or something, you'll want to save your changes up to Gitlab and typically you would use **git push** to do this however as this is a local branch, it doesn't exist yet on the project on Gitlab.  To push it to the project and set the remote Gitlab as upstream, run:
> `git push --set-upstream origin` \<`personal-identifier`\>-\<`what-you-are-working-on`\>

Once you have done this, you can now see the branch on the project web page here:<br>
https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches

Unless you actually use **git add** to add changes to your branch, you will not see them on the Gitlab project. You can see the changes that you have made using **git status**:
> `git status`

Then you can either add each file you want to commit:
> `git add \<filename/path from git status>`

Or you can go into the root directory (cyberpunk-red-code) and add everything with:
> `git add .`

Once you have added the files, go ahead a commit your changes:
> `git commit -m "Some info on what you changes you made."`

As you're working on your branch, you will probably commit/push often to save your work, so fell free to be as descriptive (or not) as you like in your commit notes.  We just ask that when you issue your Merge Request to the dev branch, in that request you describe what you have changed and commiting for everyone to see.

Once you have created your commit, you can then simply issue a **git push** to push your branch to Gitlab:
> `git push`

After your commit gets merged into dev, or any other time you want to ensure your local copy of the dev branch matches the version on Gitlab, you can synchronize it with the following:<br>
> `git checkout dev`<br>
> `git pull origin dev`

# Merging to the dev branch

Before Creating a MR!
It's important you merge your work with dev locally before creating your merge request.

> `git fetch` to get all latests info on the repo. <br>
> `git merge origin/dev` to start a merge to your local work.

Resolve any conflicts, (*feel free to ask for help with this*) and don't always assume YOUR work needs to be what stays, please take your time with this step.
Regardless of which development environment you're using, at some point you're going to be happy with your code and you want to push it to the 'dev' branch.  First, ensure you have pushed your changes on your personal branch to Gitlab.  Once you have dont that, open your web browser and peruse the project branches here:
<br>

> https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches
<br>

Locate your personal branch and to the right side of it, you will see a button titled **Merge Request**.  Click that button to open the Merge Request Form.<br>

The first thing you are going to want to do is double check the destination branch you would like to merge to. At the very top, just under **New Merge Request** you will see:<br>
> From \<personal-identifier\>-\<what-you-are-working-on\> into **dev**

If this says anything other than **dev** you are making a request to the wrong branch most likely. *But we trust you.*

The **Title** and **Description** should contain information from your commit, however, if you want to update/change them at this time or you didn't really put good information in the commit description (*not as uncommon as you would think!*), go agead and update it now before submitting.