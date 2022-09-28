<p align="center">
    <a href="https://adshares.net/" title="Adshares sp. z o.o." target="_blank">
        <img src="https://adshares.net/logos/ads.svg" alt="Adshares" width="100" height="100">
    </a>
</p>
<h3 align="center"><small>Adshares / AdController</small></h3>
<p align="center">
    <a href="https://github.com/adshares/adcontroller/issues/new?template=bug_report.md&labels=Bug">Report bug</a>
    ·
    <a href="https://github.com/adshares/adcontroller/issues/new?template=feature_request.md&labels=New%20Feature">Request feature</a>
    ·
    <a href="https://docs.adshares.net/adserver/">Docs</a>
</p>

AdController is a web application which manages other services' configuration.

## Quick Start

### Development

```
git clone https://github.com/adshares/adcontroller.git
cd adcontroller
composer install
vi .env.local # add DB credentials -> see .env
php bin/console doctrine:migrations:migrate
cp "${ADSERVER_HOME_DIR}/config/jwt/public.pem" config/jwt/public.pem
yarn
yarn dev
composer dev
```

## Contributing

Please follow our [Contributing Guidelines](docs/CONTRIBUTING.md)

## Versioning

We use [SemVer](http://semver.org/) for versioning.
For the versions available, see the [tags on this repository](https://github.com/adshares/adcontroller/tags).

## Authors

* **[Paweł Podkalicki](https://github.com/PawelPodkalicki)** - _PHP programmer_
* **[Mykola Zhura](https://github.com/Niko-Yea)** - _JS programmer_
* **[Maciej Pilarczyk](https://github.com/m-pilarczyk)** - _PHP programmer_

See also the list of [contributors](https://github.com/adshares/adcontroller/contributors) who participated in this project.

## Related projects
 
- [AdServer](https://github.com/adshares/adserver)
- [AdPanel](https://github.com/adshares/adpanel)
- [AdUser](https://github.com/adshares/aduser)
- [AdPay](https://github.com/adshares/adpay)
- [AdSelect](https://github.com/adshares/adselect)
- [ADS](https://github.com/adshares/ads)

## License

This work is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This work is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
[GNU General Public License](LICENSE) for more details.

You should have received a copy of the License along with this work.
If not, see <https://www.gnu.org/licenses/gpl.html>.
