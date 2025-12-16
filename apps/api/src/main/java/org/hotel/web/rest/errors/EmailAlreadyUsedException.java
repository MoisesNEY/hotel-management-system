package org.hotel.web.rest.errors;


public class EmailAlreadyUsedException extends BadRequestAlertException {

    private static final long serialVersionUID = 1L;

    public EmailAlreadyUsedException() {
        super(
            "El email ya existe!",
            "userManagement",
            "emailexists"
        );
    }
}
