/**
 * This code is distributed under the CC-BY-NC 4.0 license:
 * https://creativecommons.org/licenses/by-nc/4.0/
 *
 * Original author: Luuxis
 */

import path from 'path';

const defaultProperties = {
    width: 1000,
    height: 650,
    resizable: false,
    position: "center",
    frame: true,
    icon: path.join(__dirname, '../../../assets/icons/Microsoft.png')
}

module.exports = async function (url: string) {
    await new Promise((resolve: any) => {
        //@ts-ignore
        nw.Window.get().cookies.getAll({ domain: "live.com" }, async (cookies) => {
            for await (let cookie of cookies) {
                let url = `http${cookie.secure ? "s" : ""}://${cookie.domain.replace(/$\./, "") + cookie.path}`;
                //@ts-ignore
                nw.Window.get().cookies.remove({ url: url, name: cookie.name });
            }
            return resolve();
        });
    });

    let code = await new Promise((resolve) => {
        //@ts-ignore
        nw.Window.open(url, defaultProperties, (Window: any) => {
            let interval = null;
            let code;
            interval = setInterval(() => {
                if (Window.window.document.location.href.startsWith("https://login.live.com/oauth20_desktop.srf")) {
                    clearInterval(interval);
                    try {
                        code = Window.window.document.location.href.split("code=")[1].split("&")[0];
                    } catch (e) {
                        code = "cancel";
                    }
                    Window.close();
                }
            }, 100);

            Window.on('closed', () => {
                if (!code) code = "cancel";
                if (interval) clearInterval(interval);
                resolve(code);
            });
        });
    });
    return code
}