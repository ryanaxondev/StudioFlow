# ClamAV local service

ClamAV runs as a dedicated `clamd` service, matching the production service boundary. Port 3310 is exposed only on loopback so a Worker running on the host can connect without making the scanner reachable from the LAN.

Virus signatures are stored in the `clamav-signatures` named volume so database updates survive container recreation.
