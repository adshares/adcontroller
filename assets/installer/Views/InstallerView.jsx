import React, { useState } from 'react'

import { Admin, Resource } from 'react-admin'
import authProvider from '../providers/authProvider'

import { StartComponent } from '../Components/StartComponent/Start'
import { BaseComponent } from '../Components/BaseComponent/BaseComponent'
import { DnsComponent } from '../Components/DnsComponent/DnsComponent'
import { Final } from '../Components/FinalComponent/Final'
// import { ThirdStep } from '../Components/ThirdStep'


const installerElements = [
  {
    name: 'base',
    options: {label: 'Base'},
    component: 'Base',
    index: 1
  },
  {
    name: 'dns',
    options: {label: 'DNS'},
    component: 'DNS',
    index: 2
  },
  // {
  //   name: 'third',
  //   options: {label: 'Third step'},
  //   component: 'ThirdStep',
  //   index: 2
  // },
]

export const InstallerView = () => {
  const [step, setStep] = useState(2)

  const nextStep = (currentIndex, navTo) => {
    const isLastStep = currentIndex === installerElements.length
    const nextElement = installerElements.find(e => e.index === currentIndex + 1)
    setStep(currentIndex + 1)
    if(isLastStep){
      navTo('/final')
      return
    }
    navTo('/' + nextElement.name)
  }
  const prevStep = (currentIndex, navTo) => {
    const isFirstStep = currentIndex === 1
    const prevElement = installerElements.find(e => e.index === currentIndex - 1)
    // setStep(currentIndex - 1)
    if(isFirstStep){
      navTo('/start')
      return
    }
    navTo('/' + prevElement.name)
  }

  const sortedInstallerElements = installerElements.sort((a, b) => a.index - b.index)

  const orderedComponents = sortedInstallerElements.map(el =>{
    const components = {
      Base: <BaseComponent nextStep={nextStep} prevStep={prevStep} el={el}/>,
      DNS: <DnsComponent nextStep={nextStep} prevStep={prevStep} el={el}/>,
      // ThirdStep: <ThirdStep nextStep={nextStep} prevStep={prevStep} el={el}/>
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
      authProvider={authProvider}
    >
      <Resource
        name="start"
        options={{label: 'Start'}}
        list={<StartComponent nextStep={nextStep} />}
      />
      {orderedComponents}
      {step > orderedComponents.length && (
        <Resource
          name={'final'}
          options={{label: 'Final'}}
          list={<Final />}
        />
      )}
    </Admin>
  )
}
