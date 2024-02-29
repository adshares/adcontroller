<?php

namespace App\Entity\Enum;

enum AdServerConfig implements ConfigEnum
{
    public const MODULE = 'AdServer';

    case AdsTxtCheckDemandEnabled;
    case AdsTxtCheckSupplyEnabled;
    case AdsTxtDomain;
    case AdvertiserApplyFormUrl;
    case AllowZoneInIframe;
    case AutoConfirmationEnabled;
    case AutoRegistrationEnabled;
    case AutoWithdrawalLimitAds;
    case AutoWithdrawalLimitBsc;
    case AutoWithdrawalLimitBtc;
    case AutoWithdrawalLimitEth;
    case BannerRotateInterval;
    case CampaignExperimentMinBudget;
    case CampaignMinBudget;
    case CampaignMinCpa;
    case CampaignMinCpm;
    case ColdWalletAddress;
    case ColdWalletIsActive;
    case CrmMailAddressOnCampaignCreated;
    case CrmMailAddressOnSiteAdded;
    case CrmMailAddressOnUserRegistered;
    case DefaultUserRoles;
    case EmailVerificationRequired;
    case HotWalletMaxValue;
    case HotWalletMinValue;
    case InventoryExportWhitelist;
    case InventoryImportWhitelist;
    case InventoryPrivate;
    case InventoryWhitelist;
    case JoiningFeeEnabled;
    case JoiningFeeMinValue;
    case JoiningFeeValue;
    case LandingUrl;
    case LicenseData;
    case LicenseKey;
    case MaxPageZones;
    case Name;
    case OperatorRxFee;
    case OperatorTxFee;
    case PublisherApplyFormUrl;
    case PrivacyPolicy;
    case ReferralRefundCommission;
    case ReferralRefundEnabled;
    case RegistrationMode;
    case RejectedDomains;
    case SiteAcceptBannersManually;
    case SiteClassifierLocalBanners;
    case SupplyPlaceholderColor;
    case SupplyPlaceholderFile;
    case Terms;
    case UploadLimitImage;
    case UploadLimitModel;
    case UploadLimitVideo;
    case UploadLimitZip;
    case Url;
    case WalletAddress;
    case WalletNodeHost;
    case WalletNodePort;
    case WalletSecretKey;

    public function getModule(): string
    {
        return self::MODULE;
    }
}
