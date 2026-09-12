param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\audio')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
[void][Windows.Media.SpeechSynthesis.SpeechSynthesisStream, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]

function Wait-WinRtOperation {
  param(
    [Parameter(Mandatory = $true)]$Operation,
    [Parameter(Mandatory = $true)][Type]$ResultType
  )

  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
      $_.Name -eq 'AsTask' -and
      $_.IsGenericMethodDefinition -and
      $_.GetParameters().Count -eq 1
    } |
    Select-Object -First 1

  $task = $method.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.Wait()
  return $task.Result
}

$lines = @(
  @{ File = 'narrator-intro.wav'; Voice = 'Microsoft Yaoyao'; Rate = 0.88; Pitch = 0.92; Volume = 0.92; TextB64 = '55m956SB6YWS5bqX77yM5pma5LiK5Y2B5LiA54K55Zub5Y2B5LiJ5YiG44CC5L2g5Y+r6Lev6YeO77yM5piv5LuK5pma55qE5ama56S85pGE5b2x5biI44CC' },
  @{ File = 'director-hold.wav'; Voice = 'Microsoft Kangkang'; Rate = 1.05; Pitch = 0.86; Volume = 0.95; TextB64 = '6Lev6YeO77yM5Yir5Lmx5Yqo6ZWc5aS044CC5paw5aiY6ams5LiK5a6j6KqT44CC' },
  @{ File = 'narrator-seen.wav'; Voice = 'Microsoft Yaoyao'; Rate = 0.84; Pitch = 0.92; Volume = 0.92; TextB64 = '5Y+v6IuP5pma5rKh5pyJ6LWw5ZCR5Y+w5YmN44CC5aW556m/6L+H5pW06Ze05a605Lya5Y6F77yM5YGc5Zyo5L2g55qE6ZWc5aS05q2j5Lit5aSu44CC5aW55Zyo55yL5L2g44CC5LiN5piv5Zyo55yL5pGE5YOP5py644CC' },
  @{ File = 'narrator-observe.wav'; Voice = 'Microsoft Yaoyao'; Rate = 0.88; Pitch = 0.92; Volume = 0.92; TextB64 = '5L2g6Lef552A5aW55p2l5Yiw5ZCO5Y+w44CC6ZqU552A5bim6ZOB5Lid55qE546755KD77yM5aW55oqK5LiA5byg5peg5qCH6K+G6buR5Y2h6LS06L+R5L2g55qE6ZWc5aS044CC' },
  @{ File = 'narrator-intervene.wav'; Voice = 'Microsoft Yaoyao'; Rate = 0.98; Pitch = 0.92; Volume = 0.94; TextB64 = '5L2g6L+95Yiw5pyN5Yqh6Zeo5YmN77yM5Y205oCO5LmI5Lmf5oun5LiN5byA6Zeo6ZSB44CC6IuP5pma5oqK5LiA5byg5peg5qCH6K+G6buR5Y2h6LS05Zyo546755KD5LiK44CC' },
  @{ File = 'suwan-warning.wav'; Voice = 'Microsoft Huihui'; Rate = 0.72; Pitch = 1.08; Volume = 0.72; TextB64 = '5Yir5L+h5pe26Ze044CC' },
  @{ File = 'director-blackout.wav'; Voice = 'Microsoft Kangkang'; Rate = 1.12; Pitch = 0.86; Volume = 0.98; TextB64 = '5omA5pyJ5py65L2N5ZCM5pe25Lii5bin44CC6Lev6YeO77yM5L2g6L+Y55yL5b6X5Yiw5aW55ZCX77yf' },
  @{ File = 'narrator-blackout.wav'; Voice = 'Microsoft Yaoyao'; Rate = 0.84; Pitch = 0.92; Volume = 0.92; TextB64 = '5Y2B56eS5ZCO77yM54Gv6YeN5paw5Lqu6LW344CC6IuP5pma5LuO5YWr5Y+w5pGE5b2x5py66YeM5ZCM5pe25raI5aSx44CC6K2m5pa55bCB5a2Y5LqG5q+N5bim44CC5YeM5pmo77yM5L2g5pS25Yiw5LiA5Liq5rKh5pyJ5Y+R5Lu25Lq655qE5Zue5pS+5Zyw5Z2A44CC' },
  @{ File = 'anonymous-message.wav'; Voice = 'Microsoft Kangkang'; Rate = 0.78; Pitch = 0.76; Volume = 0.82; TextB64 = '5aaC5p6c6L+Y6K6w5b6X5aW577yM5bCx6K+B5piO6L+Z5Y2B56eS5LiN5bGe5LqO5ZCM5LiA5p2h5pe26Ze044CC' }
)

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$voices = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices

foreach ($line in $lines) {
  $voice = $voices | Where-Object { $_.DisplayName -eq $line.Voice -and $_.Language -eq 'zh-CN' } | Select-Object -First 1
  if (-not $voice) {
    throw "Required Windows voice '$($line.Voice)' is not installed."
  }

  $synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
  $synth.Voice = $voice
  $synth.Options.SpeakingRate = [double]$line.Rate
  $synth.Options.AudioPitch = [double]$line.Pitch
  $synth.Options.AudioVolume = [double]$line.Volume
  $text = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($line.TextB64))
  $operation = $synth.SynthesizeTextToStreamAsync($text)
  $speechStream = Wait-WinRtOperation -Operation $operation -ResultType ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $sourceStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($speechStream)
  $path = Join-Path $OutputDirectory $line.File
  $targetStream = [System.IO.File]::Open($path, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)

  try {
    $sourceStream.CopyTo($targetStream)
  }
  finally {
    $targetStream.Dispose()
    $sourceStream.Dispose()
    $speechStream.Dispose()
    $synth.Dispose()
  }

  Write-Output ("Generated {0} with {1}" -f $line.File, $line.Voice)
}
