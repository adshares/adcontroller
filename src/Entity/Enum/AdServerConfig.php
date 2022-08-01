<?php

namespace App\Entity\Enum;

enum AdServerConfig: string implements ConfigEnum
{
    public const MODULE = 'AdServer';

    case HOST_PREFIX = 'base_adserver_host_prefix';
    case LICENSE_DATA = 'license_data';
    case LICENSE_KEY = 'license_key';
    case NAME = 'base_adserver_name';
    case URL = 'base_adserver_url';
    case WALLET_ADDRESS = 'wallet_address';
    case WALLET_NODE_HOST = 'wallet_node_host';
    case WALLET_NODE_PORT = 'wallet_node_port';
    case WALLET_SECRET_KEY = 'wallet_secret_key';

    public function getModule(): string
    {
        return self::MODULE;
    }
}
