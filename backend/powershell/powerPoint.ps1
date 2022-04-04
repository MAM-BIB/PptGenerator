# Source: https://gist.github.com/ap0llo/5c5f5aadb885fe918000b248e5dd6e36
function openPowerpoint($inputFile) {
    # Load Powerpoint Interop Assembly
    [Reflection.Assembly]::LoadWithPartialname("Microsoft.Office.Interop.Powerpoint") > $null
    [Reflection.Assembly]::LoadWithPartialname("Office") > $null
    $msoFalse = [Microsoft.Office.Core.MsoTristate]::msoFalse
    $msoTrue = [Microsoft.Office.Core.MsoTristate]::msoTrue

    # start Powerpoint
    $application = New-Object "Microsoft.Office.Interop.Powerpoint.ApplicationClass" 

    # Make sure inputFile is an absolte path
    $inputFile = Resolve-Path $inputFile

    return ($application, $application.Presentations.Open($inputFile, $msoTrue, $msoFalse, $msoFalse))
}

function closePowerpoint($application, $presentation) {
    # Close Presentation
    $presentation.Close()
    $presentation = $null

    # Close Application
    if ($application.Windows.Count -eq 0) {
        $application.Quit()
    }
	
    $application = $null
	
    # Make sure references to COM objects are released, otherwise powerpoint might not close
    # (calling the methods twice is intentional, see https://msdn.microsoft.com/en-us/library/aa679807(office.11).aspx#officeinteroperabilitych2_part2_gc)
    [System.GC]::Collect();
    [System.GC]::WaitForPendingFinalizers();
    [System.GC]::Collect();
    [System.GC]::WaitForPendingFinalizers();
}
