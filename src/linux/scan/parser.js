const { dBFromPercentage } = require('../../utils/percentage-db');

const matchBssid = line =>
  line.match(
    /[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}\\:[A-F0-9]{2}/
  );

const parse = stdout =>
  stdout
    .split('\n')
    .filter(line => line !== '' && line.includes(':'))
    .filter(line => matchBssid(line))
    .map(line => {
      const match = matchBssid(line);
      const bssid = match[0].replace(/\\:/g, ':');

      const fields = line.replace(match[0]).split(':');

      const [
        // eslint-disable-next-line no-unused-vars
        active,
        ssid,
        // eslint-disable-next-line no-unused-vars
        bssidAlreadyProcessed,
        mode,
        frequency,
        quality,
        security,
        security_flags_wpa,
        security_flags_rsn
      ] = fields;

      return {
        ssid: ssid.replace(/^'|'$/g, ''),
        bssid,
        mac: bssid, // for retrocompatibility with version 1.x
        mode,
        frequency: parseInt(frequency),
        signal_level: dBFromPercentage(quality),
        quality: parseInt(quality),
        security: security !== '(none)' ? security : 'none',
        security_flags: {
          wpa: security_flags_wpa,
          rsn: security_flags_rsn
        }
      };
    })
    .filter((value, index, self) => self.findIndex(item => item.ssid === value.ssid) === index);

module.exports = parse;
