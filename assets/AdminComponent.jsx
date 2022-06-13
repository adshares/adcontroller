import React, { useState } from 'react'

import { Admin, Resource } from 'react-admin'

import { FirstStep } from './Components/FirstStep'
import { SecondStep } from './Components/SecondStep'
import { StartComponent } from './Components/Start'
import { ThirdStep } from './Components/ThirdStep'


const AdminComponent = () => {
  const [completedSteps, setCompletedSteps] = useState([])

  const steps = {
    first: 'FirstStep',
    second: 'SecondStep',
    third: 'ThirdStep',
  }

  localStorage.setItem('completedSteps', JSON.stringify(completedSteps))
  return (
    <Admin
    >
      <Resource
        name="start"
        options={{label: 'Start'}}
        list={<StartComponent setCompletedSteps={setCompletedSteps} />}
      />
      <Resource
        name="first"
        options={{label: 'First step'}}
        list={<FirstStep setState={setCompletedSteps} />}
      />
      <Resource
        name="second"
        options={{label: 'Second step'}}
        list={<SecondStep setState={setCompletedSteps} />}
      />
      <Resource
        name="third"
        options={{label: 'Third step'}}
        list={<ThirdStep setState={setCompletedSteps} />}
      />
    </Admin>
  )
}

export default AdminComponent
