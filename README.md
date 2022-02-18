# Prima
🎓 This repo contains the assignments of the course Prototyping interaktiver Medien-Apps und Games at Furtwangen University

# Final assignment: The Journey of Y

For credits etc. please see [here](https://github.com/AljoshaVieth/Prima/tree/main/projects/TheJourneyOfY)
- Title:  The Journey of Y
- Author: Aljosha Vieth
- Year and season (Summer, Winter): Winter 21/22
- Curriculum and semester: MIB 7
- Course this development was created in (PRIMA): PRIMA
- Docent: Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl
- Link to the finished and executable application on Github-Pages: https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/index.html
- Link to the source code: https://github.com/AljoshaVieth/Prima/tree/main/projects/TheJourneyOfY + https://github.com/AljoshaVieth/Prima/tree/main/projects/TheJourneyOfYStats
- Link to the design document: 
- Description for users on how to interact: Move right and left with arrow-keys or A and D. Jumpt with space. Drag objects per mous (hover->click->drag->drop). Goal is to hit the floating sphere at the far right handside with your player.
- Description on how to install, if applicable (additional services, database etc.): Place the stat.php on an addressable server supporting php. Create a MySQL like database with structure as below and alter credentials in stat.php to fit your case (line 10): 
![image](https://user-images.githubusercontent.com/12802765/154732944-c1e76fe6-d431-435f-affe-26762fcfbda5.png)

A copy of the catalogue of criteria above, the right column replaced with very brief explanations and descriptions of the fullfullments of these criteria

#### Checklist for the final assignment
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
(see [original source](https://github.com/JirkaDellOro/Prima/tree/f46e313f9068cbb88995b2c279d2f5296488def5))

|  Nr | Criterion           | Explanation                                                                                                                                                                                                                                                               |
|----:|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|   0 | Units and Positions | The player spawns on (0,4,0) and normally moves on y=0. The Player is 1x1. Since the game has an abstract design, there are no real proportions from the real world. Everything is proportioned to provide a fun gaming feeling.                                          |
|   1 | Hierarchy           | The hierarchy of the scene enables looping through specific "groups" of objects, such as controllables or the ground. It is used to set the collission groups in the main.                                                                                                |
|   2 | Editor              | The visual editor was used to generate almost all objects. It is extremely helpful because what you see is what you get which is a helpful speed advantage. The Player was not created in the editor, however it would also be possible, it´s just a personal preference. |
|   3 | Scriptcomponents    | Scriptcomponents are used to add an animation to the goalObject as well as handling camera Movement. They are very helpful.                                                                                                                                               |
|   4 | Extend              | The Player extends FudgeCore.node. Although it is not really necessary. There is also a custom Event which extends CustomEvent                                                                                                                                            |
|   5 | Sound               | Sounds are used for actions such as jumping, winning, loosing, dragging objects. There also is some music.                                                                                                                                                                |
|   6 | VUI                 | The VUI is used to show the time elapsed, which is relevant for the score.                                                                                                                                                                                                |
|   7 | Event-System        | The event system is used to determine if the game is over. It is really helpful because it enables passing the Information from the Player class or the GoalScript to the main class without any big effort.                                                              |
|   8 | External Data       | The config contains a url to the api which holds the records. There is also an option to toggle the music.                                                                                                                                                                |
|   9 | Light               | Since it´s mainly a 2D game, light isn´t necessary.                                                                                                                                                                                                                       |
|   A | Physics             | Almost all elements have rigidbodys which are used to determine collisions. Forces are used to control the Player (move + jump)                                                                                                                                           |
|   B | Net                 | It´s a singleplayer game with online statistics, so no multiplayer here, just asynchronous competition based on score.                                                                                                                                                    |
|   C | State Machines      | There are no enemies.                                                                                                                                                                                                                                                     |
|   D | Animation           | The GoalObject is animated using the animation system of FudgeCore.                                                                                                                                                                                                       |


