<h1>Contributing to FoundryVTT Cyberpunk Red System</h1>

Our process flow looks like this:

> <i>personal_branch -> dev -> master</i>

The 'dev' branch is our merge point for code. Create your own branch, save early and often, even if your branch is broken/not working and then perform a merge request to 'dev' when you're ready.

For the <i>personal_branch</i>, the convention we have been using is:

> \<personal-identifier\>-\<what-you-are-working-on\>

For instance, a branch where a developer named <i>Jay</i> might be working on the <i>character sheet</i> might be called:

> jay-character-sheet-update-skills

This document will walk through the installation/configuration of a development environment to help you start contributing.

The assumption of this document is you already have FoundryVTT installed and running on a system and you're planning to utilize that system to do your development work on.  This is the easiest option, as you can test your changes in real time.

We will cover configuring both Linux and Windows in this document.  Regardless of which environment you're using, you will need the FoundryVTT location where it is storing the User Data. If you don't remember where that directory is, pop open your browser, connect to your FoundryVTT system, go into Setup and look at the Configuration Tab to see what <i>User Data Path</i> is set to. Make a note of this as your <b>Foundry User Data Path</b> when it is referenced in the configuration section below.

<h2>Development on Linux</h2>

We are assuming you are familiar with the distribution of Linux you are using and comfortable with the installation of packages/software.  If you're not, ask in the Discord channel and someone can assist with this aspect.

Here's the steps that you will need to perform:

- Install the package: git
- Once installed, open a terminal/command line which will open a terminal and typically defaults to your home directory.
- Change directory to the <b>Foundry User Data Path</b>
  > cd \<<b>Foundry User Data Path</b>\>
- Change into the systems directory:
  > cd Data/systems
- Clone the repository with the following command:<br>
  > git clone https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core.git cyberpunk-red-core

At this point, you should be able to restart your FoundryVTT server and you should now see <b>Cyberpunk RED - CORE</b> listed in your game systems.  You can now create a world using this game system to use for testing purposes.  As you make changes to the code, you will want to hit ESC in your game world and select "Reload Application" to reload any changes you made to test them.

Your Linux environment is all setup now, please jump down to the <b>Development using git</b>.

<h2>Development on Windows</h2>

First, you're going to need to download and install git for Windows.  You can do that from here:

https://git-scm.com/download/win

After installation, hit your Windows Key then find and run <b>Git CMD</b>. 

- Change directory to the <b>Foundry User Data Path</b>
  > cd \<<b>Foundry User Data Path</b>\>
- Change into the systems directory:
  > cd Data\systems
- Clone the repository with the following command:<br>
  > git clone https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core.git cyberpunk-red-core

At this point, you should be able to restart your FoundryVTT server and you should now see <b>Cyberpunk RED - CORE</b> listed in your game systems.  You can now create a world using this game system to use for testing purposes.  As you make changes to the code, you will want to hit ESC in your game world and select "Reload Application" to reload any changes you made to test them.

Your Windows environment is all setup now.  You can close the <b>Git CMD</b> and re-open one without Administrative privileges if you like.  To continue, please jump down to the <b>Development using git</b>.

<h2>Development using git</h2>

To do development work, simply change into the cyberpunk-red-core directory in your FoundryVTT systems location and then create a new code branch in git:
> git checkout -b \<personal-identifier\>-\<what-you-are-working-on\>

This is going to create a local branch on your development system and is not visible or saved on Gitlab.  When you're done working, or you want to take a break or something, you'll want to save your changes up to Gitlab and typically you would use <b>git push</b> to do this however as this is a local branch, it doesn't exist yet on the project on Gitlab.  To push it to the project and set the remote Gitlab as upstream, run:
> git push --set-upstream origin \<personal-identifier\>-\<what-you-are-working-on\>

Once you have done this, you can now see the branch on the project web page here:<br>
https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches

Unless you actually use <b>git add</b> to add changes to your branch, you will not see them on the Gitlab project. You can see the changes that you have made using <b>git status</b>:
> git status

Then you can either add each file you want to commit:
> git add \<filename/path from git status>

Or you can go into the root directory (cyberpunk-red-code) and add everything with:
> git add .

Once you have added the files, go ahead a commit your changes:
> git commit 

As you're working on your branch, you will probably commit/push often to save your work, so fell free to be as descriptive (or not) as you like in your commit notes.  We just ask that when you issue your Merge Request to the dev branch, in that request you describe what you have changed and commiting for everyone to see.

Once you have created your commit, you can then simply issue a <b>git push</b> to push your branch to Gitlab:
> git push

After your commit gets merged into dev, or any other time you want to ensure your local copy of the dev branch matches the version on Gitlab, you can synchronize it with the following:<br>
> git checkout dev<br>
> git pull origin dev

<h2>Merging to the dev branch</h2>

Regardless of which development environment you're using, at some point you're going to be happy with your code and you want to push it to the 'dev' branch.  First, ensure you have pushed your changes on your personal branch to Gitlab.  Once you have dont that, open your web browser and peruse the project branches here:
<br>

https://Gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches
<br>

Locate your personal branch and to the right side of it, you will see a button titled <b>Merge Request</b>.  Click that button to open the Merge Request Form.<br>

The first thing you are going to want to do is change the destination of where you would like to merge to.  At the very top, just under <b>New Merge Request</b> you will see:<br>
> From \<personal-identifier\>-\<what-you-are-working-on\> into master <i>Change branches</i>

Directly next to this, click <b>Change branches</b>.

On the right side, you will see the <b>Target branch</b>.  Drop this down, select <b>dev</b> and click <b>Compare branches and continue</b>.

You will now be back at the <b>New Merge Request</b> form.  The <b>Title</b> and <b>Description</b> should contain information from your commit, however, if you want to update/change them at this time or you didn't really put good information in the commit description (not as uncommon as you would think! :) ), go agead and update it now before submitting.