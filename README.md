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
    <a href="https://github.com/adshares/adcontroller/wiki">Wiki</a>
</p>

AdController is a web application which manages other services' configuration.

## Quick Start

### Development

```
git clone https://github.com/adshares/adcontroller.git
cd adcontroller
composer install ## DO NOT MIND DATABASE ERROR
composer dump-env dev
vi .env.local.php
composer install
php bin/console lexik:jwt:generate-keypair
composer dev
```
