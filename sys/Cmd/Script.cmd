Format "/usr"
UpdateXloader "/sd0/xloader_SOC_SPR600_333.uimg"
UpdateVxboot "/sd0/vxboot.bin"
Format "/sys"
CheckFirmware
Download "/sys/OS/*"
Download "/sys/Web/*"
Download "/usr/Eip/*"
Reboot


