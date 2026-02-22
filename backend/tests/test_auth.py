# backend/tests/test_auth.py
import pytest
from tests.conftest import get_auth_headers


@pytest.mark.parametrize(
    "email, password, failure_reason",
    [
        pytest.param("admin@test.com", "admin123", None, id="admin, successful login"),
        pytest.param("manager@test.com", "manager123", None, id="manager, successful login"),
        pytest.param("customer@test.com", "customer123", None, id="customer, successful login"),
        pytest.param("admin@test.com", "admin1", "incorrect password", id="admin, incorrect password"),
        pytest.param("manager@test.com", "manager1", "incorrect password", id="manager, incorrect password"),
        pytest.param("customer@test.com", "customer1", "incorrect password", id="customer, incorrect password"),
        pytest.param("admin_inactive@test.com", "admin123", "inactive account", id="admin, inactive account"),
        pytest.param("manager_inactive@test.com", "manager123", "inactive account", id="customer, inactive account"),
        pytest.param("customer_inactive@test.com", "customer123", "inactive account", id="customer, inactive account"),
    ]

)
def test_login(client, email, password, failure_reason,
               admin_user, manager_user, customer_user,
               create_roles):
    try:
        response = client.post("/auth/login", json={
            "email": email,
            "password": password
        })
        resp = response.json()
    except Exception as e:
        return e
    if not failure_reason:
        assert response.status_code == 200
        assert "access_token" in resp
    elif failure_reason == "incorrect password":
        assert response.status_code == 401
        assert resp["detail"] == "Incorrect email or password", f"We have error response like {resp['detail']} but expected was 'Incorrect email or password'"
    elif failure_reason == "inactive account":
        assert response.status_code == 403
        assert resp["detail"] == "Account is inactive"
    else:
        pytest.skip("Unsupported test case")


