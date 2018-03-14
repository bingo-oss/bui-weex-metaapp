const Bits = {
    Read: 1,
    Create: 2,
    Edit: 4,
    Delete: 8,
    Publish: 16,
    Manage: 32,
    ChangeOwner: 64,
}

export default {
    parseBits(number) {
        return {
            canRead: number & Bits.Read,
            canCreate: number & Bits.Create,
            canEdit: number & Bits.Edit,
            // canEdit: false,
            canDelete: number & Bits.Delete,
        }
    }
}
