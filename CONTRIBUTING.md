<h1>Contributing to Cyberpunk Red Foundry VTT</h1>

Our process flow looks like this:

<i>personal_branch -> dev -> master</i>

Basically, the 'dev' branch is our merge point for code. Create your own branch, safe early and often, even if your branch is broken/not working and the perform a merge request to 'dev' when you're ready.

For the personal_branch, the convention we have been using is:<br>
\<personal-identifier\>-\<what-you-are-working-on\>

For instance, a branch where Jay might be working on the character sheet might be called:<br>
jay-character-sheet-update<br>

This document will walk through the installation/configuration of a development environment to help you start contributing.

The assumption of this document is you already have FoundryVTT installed and running on a system and you're planning to utilize that system to do your development work on.  This is the easiest option, as you can test your changes in real time.

We will cover configuring both Linux and Windows in this document.

<h2>Development on Linux</h2>

We are assuming you are familiar with the distribution of Linux you are using and comfortable with the installation of packages/software.  If you're not, ask in the Discord channel and someone can assist with this aspect.

Here's the steps that you will need to perform:

- Install the package: git
- Once installed, open a terminal/command line.  This typically defaults to your home directory so feel free to change to whatever directory you want to save the code in.  This should _not_ be the Foundry VTT systems directory!
  
- Clone the repository with the following command:<br>
git clone https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core.git
- Change into the directory and save the full path into a variable called FVTT_DEV by typing:<br>
> cd fvtt-cyberpunk-red-core<br>
> export FVTT_DEV=$(pwd)<br>
- This will result in storing the full path to the code location in the variable. You can display this typing:<br>
> echo $FVTT_DEV<br>
- When you installed Foundry VTT, you set a User Data Path directory, you're going to want to change into that directory.  If you don't remember where that directory is, pop open your browser, connect to your Foundrt VTT system, go into Setup and look at the Configuration Tab to see what User Data Path is set to. Change to that directory. <br>
> cd <user_data_path>
- Once in there, you will see 3 sub-directories, Config, Data and Logs. You're going to want to go to where FoundryVTT saves the Game Systems, so do:<br>
> cd Data/systems<br>
- We are now going to make a symbolic link (symlink) back to the code location.  The reason we have to do this is because FoundryVTT expects the directory name here to match the Game System Name stored in the system.json file. In that file, the game system is called "cyberpunk-red-core".  To create this symlink, type:<br><br>
> ln -s $FVTT_DEV cyberpunk-red-core<br>

At this point, you should be able to restart your FoundryVTT server and you should now see <b>Cyberpunk RED - CORE</b> listed in your game systems.  You can now create a world using this game system to use for testing purposes.  As you make changes to the code, you will want to hit ESC in your game world and select "Reload Application" to reload any changes you made to test them.

To do development work, simply change into the directory and then create a new code branch in git:
> cd cyberpunk-red-core<br>
> git checkout -b \<personal-identifier\>-\<what-you-are-working-on\>

This is going to create a local branch on your development system and is not visible or saved on GitLab.  When you're done working, or you want to take a break or something, you'll want to save your changes up to GitLab and typically you would use <b>git push</b> to do this however as this is a local branch, it doesn't exist yet on the project on GitLab.  To push it to the project and set the remote Gitlab as upstream, run:
> git push --set-upstream origin \<personal-identifier\>-\<what-you-are-working-on\>

Once you have done this, you can now see the branch on the project web page here:<br>
https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches

Unless you actually use <b>git add</b> to add changes to your branch, you will not see them on the Gitlab project.

You can either add each file you want to commit up:
> git add \<filename/path from git status>

Or you can go into the root directory (cyberpunk-red-code) and add everything with:
> git add .





<h2>Development on Windows</h2>

<h2>Merging to the dev branch</h2>

Regardless of which development environment you're using, at some point you're going to be happy with your code and you want to push it to the 'dev' branch.  First, ensure you have pushed your changes on your personal branch to GitLab.  Once you have dont that, open your web browser and peruse the project branches here:
<br>

https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/branches
<br>

Locate your personal branch and to the right side of it, you will see a button titled <b>Merge Request</b>.  Click that button to open the Merge Request Form.<br>

The first thing you are going to want to do is change the destination of where you would like to merge to.  At the very top, just under <b>New Merge Request</b> you will see:<br>
> From \<personal-identifier\>-\<what-you-are-working-on\> into master <i>Change branches</i>

Directly next to this, click <b>Change branches</b>.

On the right side, you will see the <b>Target branch</b>.  Drop this down, select <b>dev</b> and click <b>Compare branches and continue</b>.

You will now be back at the <b>New Merge Request</b> form.  In the <b>Title</b> box, briefly summarize what the change is and in the <b>Description</b>, you can be more descriptive around what you changes you did.