import React, { useState } from 'react'

import { Admin, Resource } from 'react-admin'

import { FirstStep } from '../Components/FirstStep'
import { SecondStep } from '../Components/SecondStep'
import { StartComponent } from '../Components/Start'
import { ThirdStep } from '../Components/ThirdStep'
import { Final } from '../Components/Final'

const installerElements = [
  {
    name: 'first',
    options: {label: 'First step'},
    component: 'FirstStep',
    props: {},
    index: 3
  },
  {
    name: 'second',
    options: {label: 'Second step'},
    component: 'SecondStep',
    props: {},
    index: 1
  },
  {
    name: 'third',
    options: {label: 'Third step'},
    component: 'ThirdStep',
    props: {},
    index: 2
  },
]

export const InstallerView = () => {
  const [step, setStep] = useState(0)
  const nextStep = (currentIndex, navTo) => {
    const nextElement = installerElements.find(e => e.index === currentIndex + 1)
    const lastStep = currentIndex === installerElements.length
    setStep(currentIndex + 1)
    if(lastStep){
      navTo('/final')
      return
    }
    navTo('/' + nextElement.name)
  }
  const prevStep = (currentIndex, navTo) => {
    const firstStep = currentIndex === 1
    const prevElement = installerElements.find(e => e.index === currentIndex - 1)
    setStep(currentIndex - 1)
    if(firstStep){
      navTo('/start')
      return
    }
    navTo('/' + prevElement.name)
  }

  const sortedInstallerElements = installerElements.sort((a, b) => a.index - b.index)

  const orderComponents = sortedInstallerElements.map(el =>{
    const components = {
      FirstStep: <FirstStep nextStep={nextStep} prevStep={prevStep} el={el}/>,
      SecondStep: <SecondStep nextStep={nextStep} prevStep={prevStep} el={el}/>,
      ThirdStep: <ThirdStep nextStep={nextStep} prevStep={prevStep} el={el}/>
    }
    if(el.index <= step){
      return (
        <Resource
          name={el.name}
          list={components[el.component]}
          options={el.options}
          key={el.index}
        />
      )
    }
  })

  return (
    <Admin
    >
      <Resource
        name="start"
        options={{label: 'Start'}}
        list={<StartComponent nextStep={nextStep} />}
      />
      {orderComponents}
      {step > orderComponents.length && (
        <Resource
          name={'final'}
          options={{label: 'Final'}}
          list={<Final />}
        />
      )}
    </Admin>
  )
}
