# Group-Project-Team-014-06


# Welcome to EasyReads
## Developers: Mreedul Gupta, Nico Tsiridis, Jiahao Xu, Mitchell Rheins, and Quinn Nicodemus

EasyReads is an interactive software that is filled with literary works with the aim to facilitate the spread of ideas. These works include a catalog of over 70,000 books and class notes for numerous courses. Upon selected a book to read the user is given the option to Annotate that specific book. This way the user can spread their thoughts and analyses of a specific part of the book. Similarily, the user will also be able to see all other annotations made by other users at the bottom of the page, allowing them to gain an insight on other peoples analyses. 

In addition to this, once the user navigates to the class notes page, they are met with the option to choose any course from our numerous catalog. From there, they can either choose to read a specific note or they can choose to add their own. 

## Technology Stack:

HTML, EJS, JS, and CSS -- Client side code that is accessible through the browser, this is how we developed our frontend.

Gutendex -- Web application framework, used this as our API, this is where we got our data to access the different books. 
Link to the Gutendex: https://gutendex.com/

Node.js -- Runtime environment (backend). Here we made calls to the API and other routes in our website to send data to the frontend. 

PostgreSQL -- Database (backend). Stored all of the data including user information, book information, class notes information, and annotation information. 

## Prerequisites to Run Application:

This app requires you to have docker installed (assumes you are using a Linux terminal): 

```
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
Check to see if it installed properly:

```
sudo docker-compose --version
```


## How to Run Locally:

Once docker is installed, clone the repository in any folder of your choice and run the following commands depending on your case:

#### If this is your first time running the application: 

```
docker compose up -d
docker compose down -v
docker compose up
```

#### If you have ran the website locally before: 

```
docker compose up
```

Once you are ready to close the website:

```
docker compose down
```

## How to Run the Tests: 



