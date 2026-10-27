; D-MERS Custom NSIS Installer Script
; Additional customizations on top of electron-builder defaults

!macro customHeader
  !system "echo D-MERS Installer Building..."
!macroend

!macro customInstall
  ; Register custom protocol dmers:// in Windows Registry
  DetailPrint "Registering dmers:// application protocol..."
  WriteRegStr HKCR "dmers" "" "URL:D-MERS Protocol"
  WriteRegStr HKCR "dmers" "URL Protocol" ""
  WriteRegStr HKCR "dmers\DefaultIcon" "" "$INSTDIR\D-MERS.exe,0"
  WriteRegStr HKCR "dmers\shell" "" ""
  WriteRegStr HKCR "dmers\shell\open" "" ""
  WriteRegStr HKCR "dmers\shell\open\command" "" '"$INSTDIR\D-MERS.exe" "%1"'

  ; Create Start Menu entry
  CreateDirectory "$SMPROGRAMS\D-MERS"
  CreateShortcut "$SMPROGRAMS\D-MERS\D-MERS.lnk" "$INSTDIR\D-MERS.exe" "" "$INSTDIR\D-MERS.exe" 0
  CreateShortcut "$SMPROGRAMS\D-MERS\Uninstall D-MERS.lnk" "$INSTDIR\Uninstall D-MERS.exe"
!macroend

!macro customUnInstall
  ; Remove custom protocol from registry
  DeleteRegKey HKCR "dmers"

  ; Remove Start Menu entries
  RMDir /r "$SMPROGRAMS\D-MERS"
!macroend
