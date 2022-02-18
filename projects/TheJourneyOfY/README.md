# The Journey of Y
# [▶ PLAY NOW](https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/index.html)

## Api
There is also an api to store score data in a database. See [TheJourneyOfYStats](https://github.com/AljoshaVieth/Prima/tree/main/projects/TheJourneyOfYStats)
## Checklist for the final assignment
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
(see [original source](https://github.com/JirkaDellOro/Prima/tree/f46e313f9068cbb88995b2c279d2f5296488def5))

|  Nr | Criterion           | Explanation                                                                                                                                                                                                                                                               |
|----:|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|   0 | Units and Positions | Where is 0, what is 1? Explain your setup of coordinate systems of the entities.                                                                                                                                                                                          |
|   1 | Hierarchy           | The hierarchy of the scene enables looping through specific "groups" of objects, such as controllables or the ground. It is used to set the collission groups in the main.                                                                                                |
|   2 | Editor              | The visual editor was used to generate almost all objects. It is extremely helpful because what you see is what you get which is a helpful speed advantage. The Player was not created in the editor, however it would also be possible, it´s just a personal preference. |
|   3 | Scriptcomponents    | Scriptcomponents are used to add an animation to the goalObject as well as handling camera Movement. They are very helpful.                                                                                                                                               |
|   4 | Extend              | The Player extends FudgeCore.node. Although it is not really necessary. There is also a custom Event which extends CustomEvent                                                                                                                                            |
|   5 | Sound               | Sounds are used for actions such as jumping, winning, loosing, dragging objects. There also is some music.                                                                                                                                                                |
|   6 | VUI                 | Create a virtual user interface using the interface controller and mutables. Explain the interface.                                                                                                                                                                       |
|   7 | Event-System        | The event system is used to determine if the game is over. It is really helpful because it enables passing the Information from the Player class or the GoalScript to the main class without any big effort.                                                              |
|   8 | External Data       | The config contains a url to the api which holds the records.                                                                                                                                                                                                             |
|   9 | Light               | Since it´s mainly a 2D game, light isn´t necessary.                                                                                                                                                                                                                       |
|   A | Physics             | Almost all elements have rigidbodys which are used to determine collisions. Forces are used to control the Player (move + jump)                                                                                                                                           |
|   B | Net                 | It´s a singleplayer game with online statistics, so no multiplayer here, just asynchronous competition based on score.                                                                                                                                                    |
|   C | State Machines      | There are no enemies.                                                                                                                                                                                                                                                     |
|   D | Animation           | The GoalObject is animated using the animation system of FudgeCore.                                                                                                                                                                                                       |

## Credit
### Sounds
| Sound                                    | Credit                                                                                                                                                                                   |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Swosh sound (when controlling an object) | [swosh.wav](https://freesound.org/people/AudioPapkin/sounds/444644/) by user AudioPapkin on freesound.org, licensed under the [CC0](https://creativecommons.org/publicdomain/zero/1.0/). |
| Jump                                     | [jump.wav](https://freesound.org/people/jalastram/sounds/386614/) by user jalastram on freesound.org, licensed under the [CC0](https://creativecommons.org/publicdomain/zero/1.0/).      |
| Victory                                  | [victory.wav](https://freesound.org/people/Kubatko/sounds/336725/) by user Kubatko on freesound.org, licensed under the [CC0](https://creativecommons.org/publicdomain/zero/1.0/).       |
| Defeat                                   | [defeat.wav](https://freesound.org/people/Kubatko/sounds/196584/) by user Kubatko on freesound.org, licensed under the [CC0](https://creativecommons.org/publicdomain/zero/1.0/).        |
| Ambient music                            | [music.wav](https://freesound.org/people/ShortRecord/sounds/522589/) by user ShortRecord on freesound.org, licensed under the [CC0](https://creativecommons.org/publicdomain/zero/1.0/). |

### Textures
Generated with [LowPoly Generator](https://cojdev.github.io/lowpoly/). Some are based on free to use images from [Unsplash](https://unsplash.com) and [Poly Haven](https://polyhaven.com). 
