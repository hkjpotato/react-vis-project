# React + D3 Visualization of Electrical Grid System (DEMO)

__[Video]__

__[Live Demo]__


## Basic product requirements 

###Purpose:
Provide an interface for user to clearly see the structure of a grid, and carry out CRUD manipulation on it. The grid system will be used as an input for smart power analysis tools.

###User Requirements:
 - Display the layout of a grid system in different levels.
 - Being able to switch between two view modes (Vis + Table).
 - Under both modes, perform selection & filtering of the elements.
 - Under table mode, be able to sort the items.
 - The interaction of two modes should be sync.
 - CRUD of the elements.
 - Mapping. Show different details in different levels.

## Design Challenges
There are 3 major challenges when developping this application
 - 1. Thinking in React: use React to maintain an uniform state of the application, and abstract the data of backend from the frontend UI.
 - 2. Let D3 work with React
 - 3. Dynamically fetching data for the map visualization based on viewport.

Note that this is one part of the whole simulator project, the backend detail will be updated in another [repos](https://github.com/hkjpotato/pg-archive) soon.

![img.034](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.034.png)
![img.035](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.035.png)
![img.036](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.036.png)
![img.037](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.037.png)
![img.038](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.038.png)
![img.039](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.039.png)
![img.040](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.040.png)
![img.041](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.041.png)
![img.042](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.042.png)
![img.043](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.043.png)
![img.044](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.044.png)
![img.045](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.045.png)
![img.046](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.046.png)
![img.047](https://raw.githubusercontent.com/hkjpotato/react-map-vis-demo/master/img/vis_img.047.png)

[Live Demo]: <http://52.24.114.125/pgdemo/public/>
[Video]: <https://youtu.be/9h0TL7uOntI>
