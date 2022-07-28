<?php

namespace App\Entity\Enum;

enum AdServer: string implements ConfigurationEnum
{
    use GetModule;

    case BASE_ADSERVER_HOST_PREFIX = 'base_adserver_host_prefix';
    case BASE_ADSERVER_NAME = 'base_adserver_name';
    case BASE_ADSERVER_URL = 'base_adserver_url';
    case LICENSE_DATA = 'license_data';
    case LICENSE_KEY = 'license_key';
    case WALLET_ADDRESS = 'wallet_address';
    case WALLET_NODE_HOST = 'wallet_node_host';
    case WALLET_NODE_PORT = 'wallet_node_port';
    case WALLET_SECRET_KEY = 'wallet_secret_key';
}
