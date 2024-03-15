import { generateChecksum, EMUExamList } from './libs/handle-examlist.js';

var Checksum = '';
var Cache = [];

async function Update() {
    var checksum = await EMUExamList();
    if (checksum.checksum != Checksum) {
        console.log('[U] Checksum changed, updating exam list...');
        Cache = await EMUExamList();
        Checksum = checksum.checksum;
    } else {
        console.log('[S] Checksum is the same, no need to update');
    }
}

Update();

setInterval(async () => {
    await Update();
}, 60000);