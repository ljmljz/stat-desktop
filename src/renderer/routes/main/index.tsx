 import { Route, Routes } from 'react-router-dom';
 import { MainScreen, AllStudents, OutSchool, InSchool } from 'renderer/screens'
 
 export function MainRoutes() {
    return (
        <Routes>
            <Route path="/main" element={<MainScreen />} />
            <Route path="/allStudents" element={<AllStudents />} />
            <Route path="/inSchool" element={<InSchool />} />
            <Route path="/outSchool" element={<OutSchool />} />
            {/* <Route render={() => <Redirect to="/404" />} /> */}
        </Routes>
    )
 }