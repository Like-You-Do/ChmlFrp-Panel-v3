import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Child } from '@tauri-apps/plugin-shell';

interface Frp {
    pid: number;
    isOpen: boolean;
    log: string;
    status: {
        type: string;
        label: string;
        description: string;
    };
}

export const useFrpStore = defineStore('frp', () => {
    const frpMap = ref<Map<String, Frp>>(new Map());

    const savePid = async (id: String, pid: number) => {
        frpMap.value.set(id, {
            pid: pid,
            isOpen: true,
            log: '',
            status: {
                type: 'success',
                label: '在线',
                description: '隧道在线 一切正常',
            },
        });
        console.log(`开启隧道id: ${id},进程pid: ${pid.toString()}`);
    };

    const closePid = async (id: String) => {
        const that = frpMap.value.get(id);
        if (that != null) {
            await new Child(that.pid).kill();
            console.log(`关闭隧道id: ${id},进程pid: ${that.pid.toString()}`);
            // 移除该id
            // frpMap.value.delete(id);
            that.isOpen = false;
            that.log = '';
            that.status = {
                type: 'warning',
                label: '离线',
                description: '隧道离线 请检查客户端是否正常启动',
            };
        }
    };

    const saveOutLog = (id: String, log: String) => {
        const that = frpMap.value.get(id);
        if (that != null) {
            that.log += log.replace('\n', '<br/>');
        }
    };

    return {
        frpMap,
        savePid,
        closePid,
        saveOutLog,
    };
});
