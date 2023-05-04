<h1>MindScribe</h1>
<p>MindScribe is a smart journaling app that utilizes ChatGPT to help users enhance their mindfulness and improve their journaling experience. With the goal of making journaling more accessible and efficient, MindScribe streamlines the process of revisiting journal entries, while also providing valuable insights into users' moods and emotions. Users can create customized journals complete with a cover theme of their choice. They are then able to write notes freely, without worrying about grammar or formatting. Once a note is written, users can choose to format the note, which corrects any errors and formats the content for readability. The summarize function enables users to get an overview of an entry without having to read through it in its entirety. Mindscribe also has smart mood analysis for notes. By enabling automatic mood analysis for a journal, users can gain a deeper understanding of their emotional states and observe their mood patterns over time. MindScribe is a game-changing app that makes journaling more efficient and effective for users by leveraging the power of artificial intelligence. With its advanced features and user-friendly interface, MindScribe is the perfect tool for anyone who wants to enhance their mindfulness and improve their mental well-being.</p>
<h2>Contributors</h2>
<p>
John Danekind<br>
Blake DeHaas<br>
Ryan Garrett<br>
Elia Muncey<br>
Jared Roberts<br>
</p>
<h2>Technology Stack</h2>
<img src="All Project Code and Components/resources/images/tech_stack.png" height="500">
<h2>Application Prerequisites</h2>
<p>To run the application locally, you must install Docker. Our application uses Docker containers to function. You also need to create a .env file that contains an API key for ChatGPT</p>
<h2>Use Instructions</h2>
<p>To run the application locally, start by creating a .env file that contains the following lines:
  
# database credentials
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="pwd"
POSTGRES_DB="users_db"

# Node vars
SESSION_SECRET="super duper secret!"
OPENAI_API_KEY="your OpenAI key here"
  
Replace the OPENAI_API_KEY with your OpenAI API key by creating a key. You can create a key by going to https://openai.com/blog/openai-api . Then, start up a docker container by typing 'docker-compose up' in the terminal. Then, navigate to 'localhost:3000' in your browser to access the application locally.</p>
<h2>Test Instructions</h2>
<p>To test the application, ensure that in the file 'package.json' within the "scripts" the function "testandrun" is set as follows: 
"testandrun": "npm run prestart && npm run test && npm run start"
This will ensure that the application will run all test cases properly, as well as start up correctly.</p>
<h2>Application Access</h2>
<p>The application is currently not deployed. The application has been deployed to Microsoft Azure sucessfully for demos.</p>
