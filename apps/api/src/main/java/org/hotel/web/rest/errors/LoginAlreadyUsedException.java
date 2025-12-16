package org.hotel.web.rest.errors;

public class LoginAlreadyUsedException extends BadRequestAlertException {

    private static final long serialVersionUID = 1L;

    public LoginAlreadyUsedException() {
        super(
            "Nombre de login ya existe!",
            "userManagement",
            "userexists"
        );
    }
}
