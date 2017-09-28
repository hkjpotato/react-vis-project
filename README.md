# React + D3 Visualization of Electrical Grid System (DEMO)
![gif](./time_series.gif)

Due to sensitive data, the source code cannot be open source anymore. Below is several demo video links about the UI.

##### Previous Versions
 - [Early UX Study For In Map Interactions](https://youtu.be/D1Dew-8vRIQ)
 - [Time Series Data Color Encoding](https://youtu.be/d2QZtnUKPyw)
 
You can check the front end [design](./static_version/react) to get and idea of the frontend code. None of these previous version is a pure React App as Google Map and D3 componenet are living outside the React controlled.


##### Updated Version
 - [React SPA VERSION](https://youtu.be/TU8-Z39wn94)

The core functionality of the white background vis is developed based on [react-force](https://github.com/hkjpotato/react-force)

---

## Early Development
In the first stage, we focus on making the primary interface for the web application, and primary design for the backend application as well as the database. 

For the frontend, I choose to use ReactJS + D3 to make the visualiztion, The reason is to maintain a uniform state for the front end and try to abstract the UI layer from the backend server.

For the backend, our team is using django with a relational database. We use django because:
 1. The legacy code is developed in flask. 
 2. The team is more familiar with python, the ananlysis tool is developed in python.
 3. We want to make use of the ORM model provided by django to work with SQL database.


#### User Requirements:
Provide an interface for user to clearly see the structure of a grid, and carry out CRUD manipulation on it. The grid system will be used as an input for smart power analysis tools.

#### User Testing
I am going to carry out a user testing based on the current prototype. The details is in our team report.
