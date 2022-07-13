import React, { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicRoute from '../Components/Routes/PublicRoute'
import PrivateRoute from '../Components/Routes/PrivateRoute'
import MenuAppBar from '../Components/AppBar/AppBar'
import AppWindow from '../Components/AppWindow/AppWindow'
import Login from '../Components/Login/Login'
import NotFoundView from '../installer/Views/NotFound/NotFoundView'
import SideMenu from '../Components/SideMenu/SideMenu'
import { Box } from '@mui/material'

export default function AppController () {
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [showSideMenu, toggleSideMenu] = useState(false)

  return(
    <>
      <MenuAppBar
        showIcon={!!token}
        setToken={setToken}
        enableSideMenu
        showSideMenu={showSideMenu}
        toggleSideMenu={toggleSideMenu}
      />
      <Box sx={{display: 'flex'}}>
        <SideMenu showSideMenu={showSideMenu} toggleSideMenu={toggleSideMenu}/>
        <AppWindow>
          <Routes>
            <Route
              path="login"
              element={
                <PublicRoute restricted isLoggedIn={!!token} redirectTo={'/'}>
                  <Login setToken={setToken}/>
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute isLoggedIn={!!token}>
                  <h1>LOGIN SUCCESS</h1>
                  <div>
                    <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores et eum expedita, facere
                      incidunt ipsa itaque iure iusto laudantium nihil optio possimus quam, quisquam recusandae rerum sed,
                      sunt ullam velit!
                    </div>
                    <div>Accusamus, amet culpa dolore doloremque earum et explicabo fugiat itaque maiores maxime molestias
                      neque, nostrum placeat quia quo reiciendis soluta, vitae voluptatum! Deserunt, molestiae nihil odio
                      possimus praesentium quos sed.
                    </div>
                    <div>Ab amet consequuntur doloremque eum itaque iure labore magnam nihil nobis, odit officia
                      praesentium quae quos sint, tenetur! Aliquam architecto dolore, doloremque est impedit in inventore
                      modi non quod suscipit.
                    </div>
                    <div>Accusamus aliquam architecto delectus, error exercitationem provident suscipit temporibus ullam?
                      Alias autem consequuntur deleniti dolorem enim est et eum ex harum incidunt molestiae perspiciatis
                      placeat quo rem sapiente unde, voluptates.
                    </div>
                    <div>At, dolore doloremque eum expedita explicabo labore magnam nemo officia officiis reiciendis
                      repudiandae sequi vel. Aliquam, corporis doloremque eum expedita laboriosam necessitatibus nulla
                      odit perspiciatis possimus quisquam suscipit unde voluptate!
                    </div>
                    <div>Accusamus accusantium ad aliquid architecto aspernatur delectus dolores doloribus ea eaque eos
                      eveniet fugiat fugit id ipsa, ipsam minima nam pariatur quaerat rerum saepe sit veritatis vitae? A,
                      placeat, vel?
                    </div>
                    <div>Aliquam consectetur consequuntur cum delectus dicta distinctio dolor dolores excepturi, facere
                      harum in libero minus necessitatibus nostrum numquam pariatur placeat porro praesentium quaerat quo,
                      sit soluta sunt vitae voluptate voluptatibus?
                    </div>
                    <div>Ad, amet atque beatae culpa cupiditate dolor ducimus explicabo fugiat ipsam iste laboriosam,
                      mollitia nam officia quas quia, repudiandae sint! Corporis dolor inventore ipsa, libero magnam
                      molestias optio perferendis quisquam.
                    </div>
                    <div>At error et impedit ipsum iste officia voluptatibus voluptatum! Asperiores dolore est facere illo
                      iusto nostrum omnis porro quis suscipit. Adipisci autem earum fugiat fugit laboriosam nobis, officia
                      possimus vero?
                    </div>
                    <div>Architecto, cum delectus dolor dolore facilis magnam necessitatibus porro quae sapiente sint.
                      Accusamus corporis culpa cupiditate et eveniet expedita, facilis, ipsum laboriosam laudantium nam
                      necessitatibus obcaecati porro qui quibusdam sunt?
                    </div>
                    <div>Ab, consequatur consequuntur, delectus distinctio dolore doloremque eligendi excepturi fugit illo
                      in laboriosam minima modi molestias odio porro quae quam, quasi quibusdam quisquam ratione sapiente
                      similique soluta tempora tenetur voluptate.
                    </div>
                    <div>Accusamus alias aliquam beatae commodi consequatur ea earum, eius error esse eum fugiat in iusto
                      labore libero necessitatibus nemo nisi obcaecati perspiciatis possimus quia quisquam reiciendis
                      repudiandae, sit suscipit ullam!
                    </div>
                    <div>Dolores non numquam odio, officiis optio quos similique tempora temporibus veniam. Aliquid
                      commodi consequatur corporis reprehenderit! Animi architecto beatae ducimus eum excepturi neque
                      quaerat, suscipit voluptatum. Doloremque qui repellendus vero.
                    </div>
                    <div>Deserunt fuga iste nisi quibusdam repellat. A beatae culpa, cumque dignissimos error eum facere
                      in molestiae neque officiis optio sapiente soluta veniam? Beatae explicabo fugit hic neque
                      temporibus velit veritatis.
                    </div>
                    <div>Assumenda consequuntur esse iste iure nam placeat! Aut beatae consectetur consequatur dignissimos
                      distinctio excepturi explicabo fuga, fugit inventore neque qui tenetur? Aut culpa error magnam saepe
                      sapiente. Blanditiis, earum modi?
                    </div>
                    <div>Aliquid dolorem eos et impedit numquam, quaerat sequi voluptatem? Et inventore pariatur sint. Ad
                      aliquam fugit hic, incidunt laboriosam libero nesciunt obcaecati praesentium provident quasi
                      recusandae suscipit ullam voluptatem voluptates.
                    </div>
                    <div>Animi beatae consequatur distinctio dolorum earum, eos error eveniet harum in ipsum minus
                      molestias non, numquam odio quia repellendus soluta tenetur vitae voluptate voluptatibus. Culpa
                      dolore earum itaque quae vitae?
                    </div>
                    <div>Accusamus aliquid assumenda at autem consectetur culpa delectus, excepturi mollitia nisi officia
                      officiis perspiciatis, praesentium quae qui, quibusdam quo quod repellendus sed unde velit vero
                      voluptates voluptatum. Accusamus animi, totam?
                    </div>
                    <div>Atque enim inventore omnis optio, reprehenderit temporibus voluptates? Autem cupiditate
                      dignissimos est eum, expedita id illo laboriosam maxime, neque numquam optio placeat rerum similique
                      sit temporibus totam vero voluptate voluptatibus?
                    </div>
                    <div>Aut iste perferendis quae quibusdam quis! Dolore, eligendi, eveniet. Accusamus aspernatur at
                      autem dolor doloribus eos esse ex, excepturi fuga maxime officiis perferendis placeat praesentium
                      quasi quod sequi similique voluptates.
                    </div>
                    <div>Cum, fugiat laboriosam neque nostrum optio recusandae vero voluptatem. Aliquam architecto, at
                      beatae commodi distinctio id impedit iste maiores officia officiis perferendis quia quod quos
                      repellat sunt temporibus ut vel!
                    </div>
                    <div>A adipisci animi, atque beatae ducimus eligendi eveniet exercitationem ipsam iusto, minus
                      molestias necessitatibus obcaecati odio officiis provident quae quibusdam quo quos repudiandae,
                      saepe sed sint sit tempora ut voluptas!
                    </div>
                    <div>Aperiam aspernatur atque debitis dolores eius fugiat fugit illo incidunt ipsa iste itaque nemo
                      nesciunt nostrum qui quidem repudiandae tenetur, ut voluptas? Adipisci cum enim molestiae officiis
                      ullam? Perspiciatis, saepe.
                    </div>
                    <div>A alias aliquam animi aperiam aut autem blanditiis culpa debitis dolorem dolorum esse et
                      exercitationem expedita harum illo incidunt inventore molestias obcaecati, officiis pariatur
                      praesentium quibusdam ratione recusandae saepe sit.
                    </div>
                    <div>Adipisci aspernatur eligendi ipsa iure, maiores quia quis quisquam tenetur ullam veniam!
                      Assumenda dicta eos error mollitia, natus nihil qui similique temporibus voluptate voluptatum.
                      Accusantium dolores ipsum pariatur porro quam.
                    </div>
                    <div>Autem distinctio labore laudantium numquam recusandae similique tenetur. Architecto autem dolor
                      dolorem doloribus eligendi enim exercitationem explicabo fugit, id laborum maxime necessitatibus
                      nisi nulla quia quisquam quod tempore unde voluptatum!
                    </div>
                    <div>Aspernatur doloribus ea excepturi expedita fugit impedit in ipsam nostrum numquam, tenetur.
                      Adipisci aliquam architecto consectetur earum exercitationem, harum ipsa iste laboriosam maiores
                      minus numquam praesentium quasi saepe, tempore voluptatem?
                    </div>
                    <div>A adipisci atque consectetur consequuntur culpa dignissimos, dolore, et ex exercitationem
                      explicabo in labore, nobis officia quia reiciendis similique tempora? Assumenda illo illum laborum
                      maiores nobis suscipit? Deserunt exercitationem, perspiciatis.
                    </div>
                    <div>Accusantium adipisci aspernatur atque consectetur debitis dolor dolorum ducimus earum eligendi
                      eos est excepturi explicabo facilis fuga, fugit minima molestiae mollitia ratione, vel veniam.
                      Consequatur distinctio facilis illo voluptate voluptatem.
                    </div>
                    <div>Ab, accusantium beatae exercitationem expedita fugiat illo libero magnam odio pariatur qui
                      ratione reprehenderit sequi similique sint sit tenetur totam velit voluptatibus? Ex fugit id nobis
                      porro repudiandae tenetur voluptatem.
                    </div>
                    <div>Consequuntur eaque eos, magni natus numquam reprehenderit soluta! Alias cum distinctio, eaque
                      explicabo fuga fugit hic iure necessitatibus nesciunt optio, praesentium quod ratione, sequi
                      similique ullam unde vel vitae. Eveniet.
                    </div>
                    <div>Ab consectetur debitis dolor dolore dolores, quod? Aperiam blanditiis commodi cupiditate dolor
                      eaque iste itaque minus nobis pariatur, quia quis suscipit tempore ut voluptatem voluptatibus. Culpa
                      id nobis non obcaecati!
                    </div>
                    <div>Expedita necessitatibus, veritatis! A consequatur debitis dolorum ex explicabo libero maiores
                      minima modi mollitia nemo nesciunt nihil, obcaecati, quam quibusdam quis sequi totam unde voluptas?
                      Ab deleniti impedit provident unde!
                    </div>
                    <div>A ad aliquid aspernatur debitis doloribus incidunt modi, quam tempore vitae. Deleniti laudantium
                      porro quidem similique. Ab accusamus ad iste nisi nulla numquam perferendis ratione voluptatem
                      voluptates voluptatum. Alias, ipsa.
                    </div>
                    <div>Maxime modi optio placeat porro reiciendis? Animi delectus esse est et, facere illo illum ipsa
                      iusto, molestias necessitatibus praesentium quas sapiente similique? Ad commodi corporis dolorem
                      earum error tempore voluptatum.
                    </div>
                    <div>Accusamus asperiores at commodi dolore dolores dolorum ea est et expedita explicabo fugit ipsa,
                      iusto maiores maxime, modi obcaecati perspiciatis provident quasi ratione recusandae repellendus
                      sapiente sit ullam ut voluptatibus?
                    </div>
                    <div>Atque autem blanditiis ducimus ea eaque error exercitationem facere illo laborum libero,
                      molestiae nemo nulla odio omnis placeat porro quae quidem repellat repudiandae saepe sit suscipit
                      vel vitae voluptate voluptatem.
                    </div>
                    <div>Doloremque dolorum id labore necessitatibus obcaecati odio provident saepe tempore totam? Aliquam
                      aspernatur delectus eaque quibusdam, repellendus rerum voluptatibus? Accusantium adipisci deserunt
                      ratione repellendus. Aliquid commodi debitis dolores eligendi possimus!
                    </div>
                    <div>Ad, excepturi magnam nihil officiis quos reiciendis? A architecto culpa dolorem, eveniet illum
                      laborum libero maiores nostrum nulla numquam, omnis placeat quae quam quo ratione reprehenderit
                      saepe soluta tempore veritatis?
                    </div>
                    <div>Ab, amet consequatur corporis cum delectus dolores ducimus enim ex explicabo fuga fugiat illo
                      inventore iste iure laborum minus necessitatibus perferendis quas qui quia repudiandae veniam vero,
                      voluptas voluptate voluptatibus!
                    </div>
                    <div>A beatae blanditiis, dolorem doloremque dolores eos et eveniet expedita libero magnam praesentium
                      quam quas quisquam recusandae reiciendis sapiente tempora ullam unde, veritatis voluptate.
                      Architecto cum et in numquam placeat?
                    </div>
                    <div>A alias aperiam aspernatur beatae consequuntur corporis deleniti ex facilis ipsum iste iusto
                      necessitatibus, nihil nulla, omnis possimus quasi qui quibusdam quo quos rem sint soluta unde
                      voluptatibus. Cum, nobis.
                    </div>
                    <div>Deserunt doloribus eius quaerat quos ratione? A ab accusamus assumenda delectus dolorem dolores
                      error eveniet itaque laborum modi necessitatibus nemo, nobis nostrum numquam quas quasi quibusdam,
                      sed similique soluta unde?
                    </div>
                    <div>Accusantium assumenda corporis dignissimos dolores, error et eum exercitationem fuga iure iusto
                      libero minus nam nesciunt numquam omnis perferendis porro quam quibusdam quisquam, rem reprehenderit
                      saepe sequi tempora vero voluptates!
                    </div>
                    <div>Dignissimos et iste, itaque natus quisquam voluptatibus? At iure laborum placeat veniam
                      voluptatum. Aperiam at doloribus ea impedit minus nam necessitatibus, nulla perferendis quibusdam,
                      repudiandae, tempora tenetur. Ab, autem laboriosam.
                    </div>
                    <div>Accusamus adipisci aspernatur deserunt dignissimos earum esse fugiat id ipsum labore maiores,
                      minus molestiae nam necessitatibus nulla numquam officia provident quas qui quisquam reiciendis
                      similique tempore ullam velit veniam voluptates.
                    </div>
                    <div>Consequatur cumque, deleniti dolor, exercitationem ipsa minima nostrum optio quasi quidem quis
                      quo reprehenderit tempora voluptatem? At commodi dicta distinctio necessitatibus nostrum officia
                      perspiciatis repellendus, unde. Asperiores fuga officia vero.
                    </div>
                    <div>Ab aliquam eius esse libero nam odio perferendis quas quis rem suscipit tempore veniam voluptate,
                      voluptatem. Architecto assumenda atque beatae dignissimos, ducimus facere harum, illum nostrum
                      officiis perspiciatis repudiandae vero!
                    </div>
                    <div>Facilis, fuga illum iure necessitatibus nemo obcaecati possimus quae rem tempore voluptatibus!
                      Deserunt dicta eius iure reiciendis soluta. Aliquam enim tempore voluptatibus. Asperiores blanditiis
                      incidunt nam placeat quasi repudiandae sapiente.
                    </div>
                    <div>A aliquam, aspernatur cumque distinctio est et, expedita facilis mollitia natus qui quibusdam
                      recusandae sit, tempore tenetur veritatis. Ad atque eius hic minima mollitia nostrum, obcaecati
                      porro saepe? Quibusdam, quis!
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFoundView/>}/>
            <Route path="/steps/*" element={<Navigate to={'/'}/>}/>
          </Routes>

        </AppWindow>
      </Box>
    </>
  )
}
