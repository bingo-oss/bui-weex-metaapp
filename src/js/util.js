var modal = weex.requireModule('modal')

function toast(msg) {
    modal.toast({
        message: msg,
    })
}
function alert(msg) {
    modal.alert({
        message: msg,
    })
}

export default {
    toast,
    alert
}
