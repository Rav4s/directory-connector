﻿namespace Bit.Core.Models
{
    public class AzureConfiguration
    {
        public string Tenant { get; set; } = "yourcompany.onmicrosoft.com";
        public string Id { get; set; }
        public EncryptedData Secret { get; set; }
    }
}
